interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    data?: {
      price_change_percentage_24h?: {
        usd?: number;
      };
    };
  };
}

interface TrendingBarProps {
  trending: TrendingCoin[];
}

export default function TrendingBar({ trending }: TrendingBarProps) {
  return (
    <div
      style={{
        height: "36px",
        backgroundColor: "#0a0a0a",
        borderBottom: "1px solid #222222",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        overflowX: "auto",
        whiteSpace: "nowrap",
        gap: "32px",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#888888",
          marginRight: "8px",
          flexShrink: 0,
        }}
      >
        Trending:
      </span>

      {trending.slice(0, 8).map((t, index) => {
        const change = t.item.data?.price_change_percentage_24h?.usd ?? 0;
        const isPositive = change >= 0;

        return (
          <div
            key={t.item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                color: "#555555",
              }}
            >
              {index + 1}
            </span>
            <span style={{ color: "#ffffff" }}>
              {(t.item.symbol ?? "").toUpperCase()}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                color: isPositive ? "#00C48C" : "#ef4444",
              }}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}