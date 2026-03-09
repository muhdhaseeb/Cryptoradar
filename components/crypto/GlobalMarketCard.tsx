interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_change_percentage_24h_usd: number;
    market_cap_percentage: { btc: number; eth: number };
  };
}

interface GlobalMarketCardProps {
  global: GlobalData;
}

export default function GlobalMarketCard({ global }: GlobalMarketCardProps) {
  // defensive access and early return if structure is missing
  const data = global?.data;
  if (!data) {
    return (
      <div
        style={{
          backgroundColor: "#111111",
          border: "1px solid #222222",
          borderRadius: "4px",
          padding: "16px",
          color: "#888888",
          fontSize: "13px",
        }}
      >
        Global data unavailable
      </div>
    );
  }

  const marketCap = data.total_market_cap?.usd ?? 0;
  const volume = data.total_volume?.usd ?? 0;
  const change = data.market_cap_change_percentage_24h_usd ?? 0;
  let btcDom = data.market_cap_percentage?.btc ?? 0;
  let ethDom = data.market_cap_percentage?.eth ?? 0;
  const isPositive = change >= 0;

  // clamp dominance to valid ranges
  btcDom = Math.min(Math.max(btcDom, 0), 100);
  ethDom = Math.min(Math.max(ethDom, 0), 100);
  const totalDom = btcDom + ethDom;
  if (totalDom > 100) {
    // scale proportionally
    const scale = 100 / totalDom;
    btcDom *= scale;
    ethDom *= scale;
  }

  const formatT = (n: number) => {
    if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div
      style={{
        backgroundColor: "#111111",
        border: "1px solid #222222",
        borderRadius: "4px",
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
          Global Market
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px" }}>

        {/* Total Market Cap */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#888888" }}>
            Total Market Cap
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: 600,
                letterSpacing: "-0.5px",
                fontFamily: "monospace",
              }}
            >
              {formatT(marketCap)}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "monospace",
                color: isPositive ? "#00C48C" : "#ef4444",
              }}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 24h Volume */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#888888" }}>24h Volume</div>
          <div style={{ marginTop: "4px" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                fontFamily: "monospace",
                color: "#888888",
              }}
            >
              {formatT(volume)}
            </span>
          </div>
        </div>

        {/* BTC Dominance */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#888888" }}>BTC Dominance</span>
            <span style={{ fontFamily: "monospace" }}>
              {btcDom.toFixed(1)}%
            </span>
          </div>
          {/* Progress bar */}
          <div
            style={{
              display: "flex",
              height: "8px",
              borderRadius: "4px",
              overflow: "hidden",
              backgroundColor: "#222222",
            }}
          >
            <div
              style={{
                width: `${btcDom}%`,
                background: "#f7931a",
              }}
            />
            <div
              style={{
                width: `${ethDom}%`,
                background: "#627eea",
              }}
            />
          </div>
          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "8px",
              fontSize: "11px",
              color: "#888888",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  background: "#f7931a",
                  borderRadius: "2px",
                }}
              />
              BTC
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  background: "#627eea",
                  borderRadius: "2px",
                }}
              />
              ETH
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  background: "#222222",
                  borderRadius: "2px",
                }}
              />
              Alts
            </div>
          </div>
        </div>

        {/* Fear & Greed — static for now */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#888888" }}>Fear & Greed Index</span>
            <span style={{ fontFamily: "monospace", color: "#00C48C" }}>
              74 (Greed)
            </span>
          </div>
          <div
            style={{
              height: "8px",
              borderRadius: "4px",
              background:
                "linear-gradient(to right, #ef4444, #888888, #00C48C)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "74%",
                top: "-2px",
                bottom: "-2px",
                width: "2px",
                background: "white",
                boxShadow: "0 0 4px black",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}