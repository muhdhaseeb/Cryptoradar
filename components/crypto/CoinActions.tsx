"use client";

interface Props {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
}

export default function CoinActions({ coinId, coinName, coinSymbol, coinImage }: Props) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
      {/* show coin image for context */}
      <img
        src={coinImage}
        alt={coinName}
        width={24}
        height={24}
        style={{ borderRadius: "50%" }}
      />
      <button
        onClick={() =>
          alert(`Watchlist for ${coinName} (${coinSymbol}) coming in Phase 5!`)
        }
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Watchlist
      </button>
      <button
        onClick={() =>
          alert(`Alerts for ${coinSymbol} (id: ${coinId}) coming in Phase 6!`)
        }
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
        </svg>
        Set Alert
      </button>
    </div>
  );
}