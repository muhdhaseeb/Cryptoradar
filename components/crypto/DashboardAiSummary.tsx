"use client";

import { useState, useEffect } from "react";

export default function DashboardAiSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchSummary(force = false) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/ai-summary?coinId=bitcoin${force ? "&force=true" : ""}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      if (err?.name !== "AbortError") setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSummary(); }, []);

  return (
    <div style={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "4px" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #222222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            AI Market Summary
          </span>
          <span style={{ fontSize: "10px", background: "rgba(168,85,247,0.15)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.3)", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
            GEMINI
          </span>
        </div>
        <button
          onClick={() => fetchSummary(true)}
          disabled={loading}
          title="Regenerate"
          style={{ background: "transparent", border: "none", color: "#555555", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.4 : 1, padding: "2px" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#A855F7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#555555"; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "16px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[100, 85, 70].map((w, i) => (
              <div key={i} style={{ height: "12px", width: `${w}%`, background: "rgba(255,255,255,0.06)", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </div>
        ) : error ? (
          <div style={{ color: "#555555", fontSize: "12px" }}>
            Failed to load.{" "}
            <button onClick={() => fetchSummary()} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "12px", padding: 0 }}>
              Retry
            </button>
          </div>
        ) : (
          <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#888888", margin: 0 }}>
            {summary}
          </p>
        )}
      </div>
    </div>
  );
}