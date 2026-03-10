import { getCoinDetail, getCoinHistory, formatPrice, formatPercentage, formatNumber } from "@/lib/coingecko";
import CoinChart from "@/components/crypto/CoinChart";
import CoinActions from "@/components/crypto/CoinActions";
import { notFound } from "next/navigation";

export default async function CoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [coin, history] = await Promise.all([
    getCoinDetail(id),
    getCoinHistory(id, 30),
  ]);

  if (!coin) notFound();

  // getCoinHistory can return null if the external API fails; provide a safe
  // fallback so the chart component never receives `null` and crash.
  const chartHistory = history ?? { prices: [] };

  const price = coin.market_data.current_price.usd;
  const change24h = coin.market_data.price_change_percentage_24h;
  const isPositive = (change24h ?? 0) >= 0;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "24px", alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div>
          {/* Coin Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <img
                src={coin.image.large}
                alt={coin.name}
                width={48}
                height={48}
                style={{ borderRadius: "50%" }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-0.02em" }}>{coin.name}</span>
                  <span style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 500, color: "#94a3b8" }}>
                    {coin.symbol.toUpperCase()}
                  </span>
                  <span style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 500, color: "#94a3b8" }}>
                    Rank #{coin.market_cap_rank ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontSize: "32px", fontWeight: 600, fontFamily: "monospace" }}>
                {formatPrice(price)}
              </span>
              <span style={{
                background: isPositive ? "rgba(0,196,140,0.15)" : "rgba(239,68,68,0.15)",
                color: isPositive ? "#00C48C" : "#ef4444",
                padding: "4px 10px",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isPositive
                    ? <path d="M12 19V5M5 12l7-7 7 7" />
                    : <path d="M12 5v14M5 12l7 7 7-7" />}
                </svg>
                {formatPercentage(change24h)}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
            <CoinChart coinId={id} initialHistory={chartHistory} />
          </div>

          {/* AI Summary */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span style={{ fontSize: "16px", fontWeight: 500 }}>AI Market Summary</span>
              <span style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "4px" }}>Powered by Gemini</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
              AI summaries coming in Phase 7 — Gemini integration will analyze price action, on-chain data, and market sentiment for {coin.name}.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ marginTop: "65px" }}>
          {/* Action Buttons */}
          <CoinActions coinId={id} coinName={coin.name} coinSymbol={coin.symbol.toUpperCase()} coinImage={coin.image.large} />

          {/* Market Stats */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "24px", marginTop: "30px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "20px" }}>Market Stats</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "24px" }}>
              {[
                { label: "Market Cap", value: formatNumber(coin.market_data?.market_cap?.usd ?? null) },
                { label: "24h Volume", value: formatNumber(coin.market_data?.total_volume?.usd ?? null) },
                {
                  label: "Circulating Supply",
                  value: (() => {
                    const circ = coin.market_data?.circulating_supply ?? null;
                    return circ !== null ? `${(circ / 1_000_000).toFixed(2)}M ${coin.symbol.toUpperCase()}` : "—";
                  })(),
                },
                {
                  label: "24h High / Low",
                  value: `${formatPrice(coin.market_data?.high_24h?.usd ?? null)} / ${formatPrice(
                    coin.market_data?.low_24h?.usd ?? null
                  )}`,
                  small: true,
                },
                { label: "All Time High", value: formatPrice(coin.market_data?.ath?.usd ?? null) },
                {
                  label: "ATH Change",
                  value: formatPercentage(coin.market_data?.ath_change_percentage?.usd ?? null),
                },
              ].map((stat) => (
                <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                    {stat.label}
                  </span>
                  <span style={{ fontSize: stat.small ? "14px" : "18px", fontWeight: 500, fontFamily: "monospace" }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "24px 0" }} />

            {/* Recent News placeholder */}
            <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "16px" }}>Recent News</h2>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>
              News feed coming soon — will pull live articles related to {coin.name}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}