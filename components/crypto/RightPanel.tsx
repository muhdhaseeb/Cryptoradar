import Link from "next/link";
import { Coin, formatPercentage } from "@/lib/coingecko";

interface RightPanelProps {
  coins: Coin[];
}

export default function RightPanel({ coins }: RightPanelProps) {
  // Pick a few coins to show as watchlist preview
  let watchlistPreview = coins.slice(4, 8);
  if (coins.length < 8) {
    // fall back to first few coins if not enough entries
    watchlistPreview = coins.slice(0, Math.min(4, coins.length));
  }

  // Preview only — Phase 6 will connect real user alerts
  const alerts = [
    { symbol: "BTC", condition: "Crosses Above", target: "$70,000", up: true },
    { symbol: "ETH", condition: "Drops Below", target: "$3,000", up: false },
    { symbol: "SOL", condition: "24h Vol >", target: "$10B", up: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* AI Market Summary */}
      <div
        style={{
          backgroundColor: "#111111",
          border: "1px solid #222222",
          borderRadius: "4px",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #222222",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#888888",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            AI Market Summary
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "16px" }}>
          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.6,
              color: "#888888",
            }}
          >
            Market data loaded. AI summaries powered by{" "}
            <span style={{ color: "#ffffff" }}>Gemini</span> will appear here
            in Phase 7. Track{" "}
            <span style={{ color: "#ffffff" }}>
              {coins[0]?.name ?? "Bitcoin"}
            </span>{" "}
            at{" "}
            <span
              style={{
                color:
                  (coins[0]?.price_change_percentage_24h ?? 0) >= 0
                    ? "#00C48C"
                    : "#ef4444",
                fontFamily: "monospace",
              }}
            >
              {formatPercentage(coins[0]?.price_change_percentage_24h ?? 0)}
            </span>{" "}
            today.
          </p>
        </div>
      </div>

      {/* My Watchlist */}
      <div
        style={{
          backgroundColor: "#111111",
          border: "1px solid #222222",
          borderRadius: "4px",
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
            My Watchlist
          </span>
          <Link
            href="/watchlist"
            style={{
              fontSize: "11px",
              color: "#3b82f6",
              textDecoration: "none",
            }}
          >
            View All
          </Link>
        </div>

        {/* Watchlist items */}
        <div style={{ padding: "8px 16px" }}>
          {watchlistPreview.length === 0 && (
            <div style={{ color: "#888888", fontSize: "13px" }}>
              No watchlist items
            </div>
          )}
          {watchlistPreview.map((coin, i) => {
            const isPositive =
              (coin.price_change_percentage_24h ?? 0) >= 0;
            return (
              <div
                key={coin.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom:
                    i < watchlistPreview.length - 1
                      ? "1px solid #222222"
                      : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    color: "#ffffff",
                  }}
                >
                  {(coin.symbol ?? "").toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    color: isPositive ? "#00C48C" : "#ef4444",
                  }}
                >
                  {formatPercentage(coin.price_change_percentage_24h ?? 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Alerts */}
      <div
        style={{
          backgroundColor: "#111111",
          border: "1px solid #222222",
          borderRadius: "4px",
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
            Active Alerts
          </span>
          <Link
            href="/alerts"
            style={{
              fontSize: "11px",
              color: "#3b82f6",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            + ADD
          </Link>
        </div>

        {/* Alert items */}
        <div style={{ padding: "12px" }}>
          {alerts.map((alert, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#0a0a0a",
                border: "1px solid #222222",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: i < alerts.length - 1 ? "8px" : "0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: alert.up ? "#00C48C" : "#ef4444",
                  }}
                >
                  {alert.symbol}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888888",
                    marginTop: "2px",
                  }}
                >
                  {alert.condition}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#ffffff",
                }}
              >
                {alert.target}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}