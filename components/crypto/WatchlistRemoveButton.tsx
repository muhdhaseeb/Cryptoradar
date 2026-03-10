"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WatchlistRemoveButton({ coinId }: { coinId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId }),
      });

      if (!res.ok) {
        // try to extract message
        let msg = "Unknown error";
        try {
          const data = await res.json();
          msg = data?.error || JSON.stringify(data);
        } catch {
          msg = await res.text();
        }
        console.error("Failed to remove from watchlist:", res.status, msg);
        // optionally show user feedback
        alert(`Unable to remove asset: ${msg}`);
        return; // skip refresh
      }

      router.refresh(); // re-fetches server component data
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      alert("Network error removing asset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // prevent Link navigation
        handleRemove();
      }}
      disabled={loading}
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#94a3b8",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (loading || e.currentTarget.disabled) return;
        e.currentTarget.style.borderColor = "#ef4444";
        e.currentTarget.style.color = "#ef4444";
      }}
      onMouseLeave={(e) => {
        if (loading || e.currentTarget.disabled) return;
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        e.currentTarget.style.color = "#94a3b8";
      }}
    >
      {loading ? "..." : "Remove"}
    </button>
  );
}