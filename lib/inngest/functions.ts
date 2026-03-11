import { inngest } from "./client";
import { connectToDatabase } from "@/lib/mongodb";
import Alert from "@/database/models/Alert";
import User from "@/database/models/User";
import { getTopCoins, getCoinDetail } from "@/lib/coingecko";
import { sendAlertEmail } from "@/lib/email";

export const checkPriceAlerts = inngest.createFunction(
  { id: "check-price-alerts", name: "Check Price Alerts" },
  { cron: "*/5 * * * *" }, // every 5 minutes
  async () => {
    await connectToDatabase();

    // Get all active alerts
    const alerts = await Alert.find({ isActive: true, triggeredAt: null });
    if (alerts.length === 0) return { message: "No active alerts" };

    // Get live prices for all relevant coins. start with top coins
    const coins = await getTopCoins(250);
    const priceMap = new Map(coins.map((c) => [c.id, c.current_price]));

    // ensure prices for any alert coinIds not in top list
    const alertIds = [...new Set(alerts.map((a) => a.coinId))];
    for (const id of alertIds) {
      if (priceMap.get(id) === undefined) {
        const detail = await getCoinDetail(id);
        if (detail && detail.market_data?.current_price?.usd !== undefined) {
          priceMap.set(id, detail.market_data.current_price.usd);
        }
      }
    }

    let triggered = 0;

    // prefetch users to avoid N+1
    const userIds = [...new Set(alerts.map((a) => a.userId))];
    const users = await User.find({ clerkId: { $in: userIds } });
    const usersMap = new Map(users.map((u) => [u.clerkId, u]));

    for (const alert of alerts) {
      const currentPrice = priceMap.get(alert.coinId);
      if (currentPrice === undefined) continue; // allow 0 price

      const shouldTrigger =
        (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
        (alert.condition === "below" && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        try {
          // attempt to send email first
          // we will replace N+1 later by prefetching users
          const user = usersMap.get(alert.userId);
          if (user?.email) {
            await sendAlertEmail({
              to: user.email,
              coinId: alert.coinId,
              coinName: alert.coinName,
              coinSymbol: alert.coinSymbol,
              condition: alert.condition,
              targetPrice: alert.targetPrice,
              currentPrice,
            });
          }

          // only persist deactivation after email success
          alert.isActive = false;
          alert.triggeredAt = new Date();
          await alert.save();

          triggered++;
        } catch (err) {
          console.error("Error processing alert", alert._id, err);
          // if we saved early and need rollback, we could re-activate here, but
          // current flow delays persistence until after email success so nothing to
          // rollback
        }
      }
    }

    return { message: `Checked ${alerts.length} alerts, triggered ${triggered}` };
  }
);