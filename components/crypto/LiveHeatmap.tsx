"use client";

import { Coin } from "@/lib/coingecko";

interface LiveHeatmapProps {
  coins: Coin[];
}

export default function LiveHeatmap({ coins }: LiveHeatmapProps) {
  const top16 = coins.slice(0, 16);

  const getBgColor = (change: number | null) => {
    // treat only nullish as missing; 0 should still result in the mid color
    if (change == null) return "#333333";
    if (change > 10) return "#00c48c";
    if (change > 5) return "#00a878";
    if (change > 2) return "#008a63";
    if (change > 0) return "#006649";
    if (change > -2) return "#551a1a";
    if (change > -5) return "#7b2c2c";
    if (change > -10) return "#a82e2e";
    return "#ef4444";
  };

  return (
    <div
      style={{
        backgroundColor: "#111111",
        border: "1px solid #222222",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #222222",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#888888",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Top 16 Heatmap
        </span>
      </div>

      {/* Heatmap grid */}
      <div style={{ padding: "2px", flexGrow: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoRows: "60px",
            gap: "2px",
          }}
        >
          {/* BTC — spans 2x2 */}
          {top16[0] && (
            <div
              style={{
                backgroundColor: getBgColor(
                  top16[0].price_change_percentage_24h
                ),
                gridColumn: "span 2",
                gridRow: "span 2",
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              <span
                style={{ fontSize: "15px", fontWeight: 600, color: "white" }}
              >
                {top16[0].symbol.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.85)",
                  marginTop: "2px",
                }}
              >
                {(top16[0].price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                {(top16[0].price_change_percentage_24h ?? 0).toFixed(1)}%
              </span>
            </div>
          )}

          {/* ETH — spans 1x2 */}
          {top16[1] && (
            <div
              style={{
                backgroundColor: getBgColor(
                  top16[1].price_change_percentage_24h
                ),
                gridRow: "span 2",
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: "white" }}
              >
                {top16[1].symbol.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.85)",
                  marginTop: "2px",
                }}
              >
                {(top16[1].price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                {(top16[1].price_change_percentage_24h ?? 0).toFixed(1)}%
              </span>
            </div>
          )}

          {/* Rest — normal 1x1 cells */}
          {top16.slice(2).map((coin) => (
            <div
              key={coin.id}
              style={{
                backgroundColor: getBgColor(
                  coin.price_change_percentage_24h
                ),
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              <span
                style={{ fontSize: "12px", fontWeight: 500, color: "white" }}
              >
                {coin.symbol.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.85)",
                  marginTop: "2px",
                }}
              >
                {(coin.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                {(coin.price_change_percentage_24h ?? 0).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}