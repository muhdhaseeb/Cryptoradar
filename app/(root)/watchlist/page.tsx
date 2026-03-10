import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Watchlist from "@/database/models/Watchlist";
import { getTopCoins } from "@/lib/coingecko";
import Link from "next/link";
import WatchlistCard from "@/components/crypto/WatchlistCard";

interface WatchlistDBItem {
  userId: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  image?: string;
}

interface WatchlistWithPrice extends WatchlistDBItem {
  liveData?: import("@/lib/coingecko").Coin;
}

export default async function WatchlistPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let watchlistItems: WatchlistDBItem[] = [];
  let watchlistWithPrices: WatchlistWithPrice[] = [];
  let loadError = false;

  try {
    await connectToDatabase();
    watchlistItems = (await Watchlist.find({ userId }).lean()) as WatchlistDBItem[];

    const allCoins = await getTopCoins(250);
    watchlistWithPrices = watchlistItems.map((item) => {
      // if live data missing, leave undefined so card renders gracefully
      const liveData = allCoins.find((c) => c.id === item.coinId) || undefined;
      return { ...item, liveData };
    });
  } catch (err) {
    console.error("Error loading watchlist page:", err);
    // fallback values to avoid crashing UI
    loadError = true;  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", flexGrow: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <aside style={{ background: "#111111", borderRight: "1px solid #222222", padding: "24px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#555555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              My Watchlist
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "4px", background: "#0a0a0a", border: "1px solid #222222", color: "#ffffff", fontWeight: 500 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00C48C" }} />
                  All Coins
                </div>
                <span style={{ fontSize: "11px", color: "#888888", fontFamily: "monospace" }}>
                  {watchlistItems.length}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#555555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Quick Actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Link
                href="/dashboard"
                style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: "4px", color: "#888888", fontWeight: 500, textDecoration: "none", fontSize: "13px" }}
              >
                Browse Markets
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ padding: "24px", overflowY: "auto", background: "#0a0a0a" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 600 }}>My Watchlist</h1>
                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "10px", fontWeight: 600, textTransform: "uppercase", background: "rgba(0,196,140,0.1)", color: "#00C48C", border: "1px solid rgba(0,196,140,0.2)" }}>
                  Active
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#888888" }}>
                Tracking {watchlistItems.length} {watchlistItems.length === 1 ? "coin" : "coins"}
              </p>
            </div>
            <Link
              href="/dashboard"
              style={{ background: "#3b82f6", border: "1px solid #3b82f6", color: "white", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
            >
              + Add Asset
            </Link>
          </div>

          {loadError ? (
            <div style={{ background: "#111111", border: "1px solid #ef4444", borderRadius: "4px", padding: "64px 24px", textAlign: "center" }}>
              <p style={{ color: "#ef4444", fontSize: "16px", marginBottom: "8px" }}>
                Failed to load watchlist
              </p>
              <p style={{ color: "#888888", fontSize: "13px" }}>
                There was a problem connecting to the database. Please try refreshing the page.
              </p>
            </div>
          ) : watchlistItems.length === 0 ? (
            <div style={{ background: "#111111", border: "1px dashed #222222", borderRadius: "4px", padding: "64px 24px", textAlign: "center" }}>
              <p style={{ color: "#888888", fontSize: "16px", marginBottom: "16px" }}>Your watchlist is empty</p>
              <Link href="/dashboard" style={{ color: "#00C48C", fontSize: "14px", textDecoration: "none" }}>
                Browse coins on the dashboard →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {watchlistWithPrices.map((item) => (
                <WatchlistCard
                  key={item.coinId}
                  coinId={item.coinId}
                  coinName={item.coinName}
                  coinSymbol={item.coinSymbol}
                  image={item.image ?? ""}
                  liveData={item.liveData}
                />
              ))}

              {/* Add asset card */}
              <Link
                href="/dashboard"
                style={{ background: "transparent", border: "1px dashed #222222", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", height: "180px", opacity: 0.5, textDecoration: "none", color: "#ffffff", flexDirection: "column", gap: "8px" }}
              >
                <div style={{ fontSize: "24px" }}>+</div>
                <div style={{ fontSize: "12px", fontWeight: 500 }}>Add Asset</div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}