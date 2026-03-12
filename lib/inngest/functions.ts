import { inngest } from "./client";
import { connectToDatabase } from "@/lib/mongodb";
import Alert from "@/database/models/Alert";
import User from "@/database/models/User";
import Watchlist from "@/database/models/Watchlist";
import { getTopCoins, getCoinDetail } from "@/lib/coingecko";
import { sendAlertEmail } from "@/lib/email";
import { sendDailyDigestEmail } from "@/lib/emailDigest";
import { Document, UpdateOneModel } from "mongodb";

// simple masking helper so errors don't contain full addresses
function maskEmail(email: string) {
  try {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(email).digest("hex").slice(0, 8);
  } catch {
    return email.replace(/(.).+(@.+)/, "$1***$2");
  }
}

// ─── Job 1: Check Price Alerts every 5 minutes ───────────────────────────────
export const checkPriceAlerts = inngest.createFunction(
  { id: "check-price-alerts", name: "Check Price Alerts" },
  { cron: "*/5 * * * *" },
  async () => {
    await connectToDatabase();

    const alerts = await Alert.find({ isActive: true, triggeredAt: null });
    if (alerts.length === 0) return { message: "No active alerts" };

    const coins = await getTopCoins(250);
    const priceMap = new Map(coins.map((c) => [c.id, c.current_price]));

    const alertIds = [...new Set(alerts.map((a) => a.coinId))];
    for (const id of alertIds) {
      if (priceMap.get(id) === undefined) {
        const detail = await getCoinDetail(id);
        if (detail && detail.market_data?.current_price?.usd !== undefined) {
          priceMap.set(id, detail.market_data.current_price.usd);
        }
      }
    }

    const userIds = [...new Set(alerts.map((a) => a.userId))];
    const users = await User.find({ clerkId: { $in: userIds } });
    const usersMap = new Map(users.map((u) => [u.clerkId, u]));

    let triggered = 0; // count of alerts for which an email was successfully sent

    for (const alert of alerts) {
      const currentPrice = priceMap.get(alert.coinId);
      if (currentPrice === undefined) continue;

      const shouldTrigger =
        (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
        (alert.condition === "below" && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        const claimed = await Alert.findOneAndUpdate(
          { _id: alert._id, isActive: true, triggeredAt: null },
          { isActive: false, triggeredAt: new Date() },
          { new: true }
        );
        if (!claimed) continue;

        const user = usersMap.get(alert.userId);
        if (!user?.email) {
          console.error(`No email found for userId: ${alert.userId}`);
          // revert claim so alert can be retried later
          await Alert.findByIdAndUpdate(alert._id, { isActive: true, triggeredAt: null });
          continue;
        }

        try {
          await sendAlertEmail({
            to: user.email,
            coinId: alert.coinId,
            coinName: alert.coinName,
            coinSymbol: alert.coinSymbol,
            condition: alert.condition,
            targetPrice: alert.targetPrice,
            currentPrice,
          });
          triggered++;
        } catch (err) {
          console.error("Error processing alert", alert._id, err);
          // revert claim on failure
          await Alert.findByIdAndUpdate(alert._id, { isActive: true, triggeredAt: null });
        }
      }
    }

    return { message: `Checked ${alerts.length} alerts, triggered ${triggered}` };
  }
);

// ─── Job 2: Daily Market Digest email at 8am UTC ─────────────────────────────
export const sendDailyDigest = inngest.createFunction(
  { id: "send-daily-digest", name: "Send Daily Market Digest" },
  { cron: "0 8 * * *" },
  async () => {
    await connectToDatabase();

    // Get all users with email notifications enabled
    const users = await User.find({ emailNotifications: true });
    if (users.length === 0) return { message: "No users with notifications enabled" };

    // Fetch top 10 coins for digest
    const coins = await getTopCoins(10);
    if (coins.length === 0) return { message: "No coin data available" };

    let sent = 0;

    // simple exponential-backoff retry helper
    async function sendWithRetries(email: string) {
      const maxAttempts = 3;
      let attempt = 0;
      while (attempt < maxAttempts) {
        try {
          await sendDailyDigestEmail({ to: email, coins });
          return;
        } catch (err) {
          attempt++;
          if (attempt >= maxAttempts) {
            throw err;
          }
          const backoff = Math.pow(2, attempt) * 100; // 200, 400, ...ms
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }

    const batchSize = 20;
    const pauseBetweenBatches = 500; // ms

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      for (const user of batch) {
        if (!user?.email) {
          console.error("Skipping digest for user with no email", user?._id || user);
          continue;
        }
        try {
          await sendWithRetries(user.email);
          sent++;
        } catch (err) {
          const toId = user?.email ? maskEmail(user.email) : "<no-email>";
          console.error("Error sending digest to", { toId, error: err });
        }
        // small intra-batch pause to avoid throttle
        await new Promise((r) => setTimeout(r, 50));
      }
      // pause between batches
      await new Promise((r) => setTimeout(r, pauseBetweenBatches));
    }

    return { message: `Daily digest sent to ${sent}/${users.length} users` };
  }
);

// ─── Job 3: Cache watchlist prices every 10 minutes ──────────────────────────

// keep a local cache of the mongoose connection so we only call
// connectToDatabase once per module load. connectToDatabase already
// takes care of global caching but this satisfies the explicit request.
let cachedMongooseConn: typeof import("mongoose") | null = null;
async function getDbConnection() {
  if (cachedMongooseConn) return cachedMongooseConn;
  cachedMongooseConn = await connectToDatabase();
  return cachedMongooseConn;
}

export const cacheWatchlistPrices = inngest.createFunction(
  { id: "cache-watchlist-prices", name: "Cache Watchlist Prices" },
  { cron: "*/10 * * * *" },
  async () => {
    await getDbConnection();

    // Get all unique coin IDs across all watchlists
    const watchlistItems = await Watchlist.find({}).lean();
    const uniqueCoinIds = [...new Set(watchlistItems.map((w) => w.coinId))];

    if (uniqueCoinIds.length === 0) return { message: "No watchlist coins to cache" };

    // Fetch top 250 coins to cover most watchlist items
    const coins = await getTopCoins(250);
    const priceMap = new Map(coins.map((c) => [c.id, c.current_price]));
    // after we build the map we'll persist values to a cache for other
    // services to consume; we'll use MongoDB as a simple cache store with
    // a TTL on an expireAt field.

    // For any coin not in top 250, fetch individually
    let fetched = 0;
    for (const coinId of uniqueCoinIds) {
      if (!priceMap.has(coinId)) {
        const detail = await getCoinDetail(coinId);
        if (detail && detail.market_data?.current_price?.usd !== undefined) {
          priceMap.set(coinId, detail.market_data.current_price.usd);
          fetched++;
        }
      }
    }

    // persist the map entries into a cache collection with a short TTL
    try {
      const mongooseConn = await getDbConnection();
      if (!mongooseConn || !mongooseConn.connection || !mongooseConn.connection.db) {
        throw new Error("Database connection not ready when caching watchlist prices");
      }
      const db = mongooseConn.connection.db;
      const cacheCol = db.collection("watchlist_price_cache");
      const now = new Date();
      const ttlSeconds = 10 * 60; // 10 minutes
      const expireAt = new Date(now.getTime() + ttlSeconds * 1000);

      const bulkOps: UpdateOneModel<Document>[] = [];
      for (const [coinId, price] of priceMap.entries()) {
        bulkOps.push({
          updateOne: {
            filter: { key: `watchlist:price:${coinId}` },
            update: {
              $set: {
                value: price,
                expireAt,
                updatedAt: now,
              },
            },
            upsert: true,
          },
        });
      }
      if (bulkOps.length) {
        // ensure unique key index exists before writing, to avoid duplicates
        const existing = await cacheCol.indexes();
        if (!existing.some((ix) => ix.name === "key_1")) {
          await cacheCol.createIndex({ key: 1 }, { unique: true });
        }
        if (!existing.some((ix) => ix.name === "expireAt_1")) {
          await cacheCol.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
        }
        await cacheCol.bulkWrite(bulkOps, { ordered: false });
      }
    } catch (err) {
      console.error("Error caching watchlist prices", {
        error: err,
        total: uniqueCoinIds.length,
        fetched,
      });
      // propagate so the job is marked failed
      throw new Error(
        `Failed to cache prices for ${uniqueCoinIds.length} coins (${fetched} fetched): ${err}`
      );
    }

    return {
      message: `Cached prices for ${uniqueCoinIds.length} coins (${fetched} fetched individually)`,
    };
  }
);