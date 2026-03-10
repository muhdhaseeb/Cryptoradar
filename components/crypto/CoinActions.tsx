"use client";

import { useWatchlist } from "@/hooks/useWatchlist";

interface Props {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
}

export default function CoinActions({ coinId, coinName, coinSymbol, coinImage }: Props) {
  const { isWatching, loading, addToWatchlist, removeFromWatchlist } = useWatchlist(coinId);

  async function handleWatchlist() {
    try {
      if (isWatching) {
        await removeFromWatchlist(coinId);
      } else {
        await addToWatchlist({ coinId, coinName, coinSymbol, image: coinImage });
      }
    } catch (err) {
      console.error("Watchlist action failed:", err);
      // TODO: replace alert with toast/snackbar when available
      alert("Unable to update watchlist. Please try again.");
    }
  }

  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
      <button
        onClick={handleWatchlist}
        disabled={loading}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          background: isWatching ? "rgba(0,196,140,0.15)" : "transparent",
          border: `1px solid ${isWatching ? "#00C48C" : "rgba(255,255,255,0.1)"}`,
          color: isWatching ? "#00C48C" : "#ffffff",
          padding: "12px 16px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          transition: "all 0.2s ease",
        }}
      >
        {isWatching ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Watching
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Watchlist
          </>
        )}
      </button>

      <button
        onClick={() => alert("Alerts coming in Phase 6!")}
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
          transition: "all 0.2s ease",
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