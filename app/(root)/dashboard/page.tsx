import { getTopCoins } from "@/lib/coingecko";
import TrendingBar from "@/components/crypto/TrendingBar";
import GlobalMarketCard from "@/components/crypto/GlobalMarketCard";
import LiveHeatmap from "@/components/crypto/LiveHeatmap";
import CoinsTable from "@/components/crypto/CoinsTable";
import RightPanel from "@/components/crypto/RightPanel";
import DashboardBtcChart from "@/components/crypto/DashboardBtcChart";

const TIMEOUT_MS = 8000;

async function getGlobalData() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      next: { revalidate: 60 },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.data ? payload : null;
  } catch {
    return null;
  }
}

async function getTrendingData() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending", {
      next: { revalidate: 300 },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return null;
    const payload = await res.json();
    return Array.isArray(payload?.coins) ? payload : null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const [coins, globalData, trendingData] = await Promise.all([
    getTopCoins(50),
    getGlobalData(),
    getTrendingData(),
  ]);

  const bitcoin = coins.find((c) => c.id === "bitcoin") ?? coins[0];
  const btcPrices = bitcoin?.sparkline_in_7d?.price ?? [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Trending Bar */}
      {trendingData?.coins && (
        <TrendingBar trending={trendingData.coins} />
      )}

      {/* Main 3-column workspace */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 300px",
          gap: "12px",
          padding: "12px",
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        {/* Left column — Global Market + Heatmap */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {globalData && <GlobalMarketCard global={globalData} />}
          <LiveHeatmap coins={coins} />
        </div>

        {/* Center column — Bitcoin Chart + Coins Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <DashboardBtcChart
            initialPrices={btcPrices}
            currentPrice={bitcoin?.current_price ?? 0}
            priceChange={bitcoin?.price_change_percentage_24h ?? 0}
          />

          {/* Coins table */}
          <CoinsTable coins={coins} />
        </div>

        {/* Right column */}
        <RightPanel coins={coins} />
      </main>
    </div>
  );
}