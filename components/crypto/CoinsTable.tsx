"use client";

import { Coin, formatPrice, formatPercentage, formatNumber } from "@/lib/coingecko";
import Image from "next/image";
import Link from "next/link";

interface CoinsTableProps {
  coins: Coin[];
}

function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices || prices.length === 0) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  const safeRange = range || 1;
  const stepCount = Math.max(1, prices.length - 1);

  const points = prices
    .map((price, i) => {
      const x = (i / stepCount) * 80;
      const y = 24 - ((price - min) / safeRange) * 22;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="80" height="24" viewBox="0 0 80 24">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#00C48C" : "#ef4444"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function CoinsTable({ coins }: CoinsTableProps) {
  return (
    <div
      style={{
        backgroundColor: "#111111",
        border: "1px solid #222222",
        borderRadius: "4px",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
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
          Top Crypto Assets
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              color: "#888888",
              border: "1px solid #222222",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            Vol &gt; 1B
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "#888888",
              border: "1px solid #222222",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            USD
          </span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              {["#", "Asset", "Price", "24h Change", "Market Cap", "Volume (24h)", "7D Chart"].map(
                (h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i > 1 ? "right" : "left",
                      padding: "10px 16px",
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#888888",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #222222",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {coins.slice(0, 20).map((coin) => {
              const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
              return (
                <tr
                  key={coin.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1a1a1a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {/* Rank */}
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #222222",
                      fontFamily: "monospace",
                      color: "#555555",
                      fontSize: "12px",
                    }}
                  >
                    {coin.market_cap_rank}
                  </td>

                  {/* Asset */}
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #222222",
                    }}
                  >
                    <Link
                      href={`/coins/${coin.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        textDecoration: "none",
                      }}
                    >
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={24}
                        height={24}
                        style={{ borderRadius: "50%" }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            color: "#ffffff",
                          }}
                        >
                          {coin.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#888888",
                            textTransform: "uppercase",
                          }}
                        >
                          {coin.symbol}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Price */}
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #222222",
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: "#ffffff",
                    }}
                  >
                    {formatPrice(coin.current_price)}
                  </td>

                  {/* 24h Change */}
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #222222",
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: isPositive ? "#00C48C" : "#ef4444",
                    }}
                  >
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </td>

                  {/* Market Cap */}
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #222222",
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: "#888888",
                    }}
                  >
                    {formatNumber(coin.market_cap)}
                  </td>

                  {/* Volume */}
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #222222",
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: "#888888",
                    }}
                  >
                    {formatNumber(coin.total_volume)}
                  </td>

                  {/* Sparkline */}
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #222222",
                    }}
                  >
                    <Sparkline
                      prices={coin.sparkline_in_7d?.price ?? []}
                      positive={isPositive}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}