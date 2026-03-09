import { getTopCoins } from "@/lib/coingecko";
import TrendingBar from "@/components/crypto/TrendingBar";
import GlobalMarketCard from "@/components/crypto/GlobalMarketCard";
import LiveHeatmap from "@/components/crypto/LiveHeatmap";
import CoinsTable from "@/components/crypto/CoinsTable";
import RightPanel from "@/components/crypto/RightPanel";

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
  const hasBtcChart = btcPrices.length >= 2;

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

          {/* Bitcoin chart card */}
          <div
            style={{
              backgroundColor: "#111111",
              border: "1px solid #222222",
              borderRadius: "4px",
            }}
          >
            {/* Chart header */}
            <div
              style={{
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#f7931a",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  ₿
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff" }}>
                      Bitcoin
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#888888",
                        fontFamily: "monospace",
                        border: "1px solid #222222",
                        padding: "1px 6px",
                        borderRadius: "2px",
                      }}
                    >
                      BTC
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                    <span style={{ fontSize: "24px", fontWeight: 600, fontFamily: "monospace", color: "#ffffff" }}>
                      {bitcoin?.current_price
                        ? `$${bitcoin.current_price.toLocaleString("en-US")}`
                        : "—"}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontFamily: "monospace",
                        color: (bitcoin?.price_change_percentage_24h ?? 0) >= 0 ? "#00C48C" : "#ef4444",
                      }}
                    >
                      {(bitcoin?.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                      {(bitcoin?.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Time buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  backgroundColor: "#0a0a0a",
                  padding: "2px",
                  borderRadius: "4px",
                  border: "1px solid #222222",
                }}
              >
                {["1H", "24H", "7D", "1M", "1Y", "ALL"].map((t) => (
                  <button
                    key={t}
                    style={{
                      background: t === "7D" ? "#1a1a1a" : "transparent",
                      border: "none",
                      color: t === "7D" ? "#ffffff" : "#888888",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 500,
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart — SVG sparkline from real BTC data */}
            <div style={{ padding: "0 16px 16px", height: "280px" }}>
              {hasBtcChart ? (
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 280"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C48C" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00C48C" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {[70, 140, 210].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="1000"
                      y2={y}
                      stroke="#222222"
                      strokeDasharray="4"
                    />
                  ))}

                  {(() => {
                    const prices = btcPrices;
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const range = max - min || 1;
                    const points = prices.map((p, i) => {
                      const x = (i / (prices.length - 1)) * 1000;
                      const y = 270 - ((p - min) / range) * 260;
                      return `${x},${y}`;
                    });
                    const pathD = "M" + points.join(" L") + " L1000,280 L0,280 Z";
                    const lineD = "M" + points.join(" L");
                    const last = prices[prices.length - 1];
                    const lastY = 270 - ((last - min) / range) * 260;
                    return (
                      <>
                        <path d={pathD} fill="url(#chartGrad)" />
                        <path d={lineD} fill="none" stroke="#00C48C" strokeWidth="2" />
                        <circle cx={1000} cy={lastY} r="4" fill="white" stroke="#111111" strokeWidth="2" />
                      </>
                    );
                  })()}
                </svg>
              ) : (
                <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#555555", fontSize: "13px" }}>
                  Chart data unavailable
                </div>
              )}
            </div>
          </div>

          {/* Coins table */}
          <CoinsTable coins={coins} />
        </div>

        {/* Right column */}
        <RightPanel coins={coins} />
      </main>
    </div>
  );
}
