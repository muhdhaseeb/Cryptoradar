"use client";

import { useState, useEffect } from "react";

interface Props {
  coinId: string;
  coinName: string;
}

export default function AiSummary({ coinId, coinName }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchSummary(force = false) {
    setLoading(true);
    setError(false);
    try {
      const url = force
        ? `/api/ai-summary?coinId=${coinId}&force=true`
        : `/api/ai-summary?coinId=${coinId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSummary(data.summary);
      setGeneratedAt(data.generatedAt);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, [coinId]);

  return (
    <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>AI Market Summary</span>
          <span style={{ fontSize: "10px", background: "rgba(168,85,247,0.15)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.3)", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
            GEMINI
          </span>
        </div>

        <button
          onClick={() => fetchSummary(true)}
          disabled={loading}
          title="Regenerate summary"
          style={{ background: "transparent", border: "1px solid #222222", color: "#888888", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: loading ? 0.5 : 1, transition: "all 0.2s" }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = "#A855F7"; e.currentTarget.style.color = "#A855F7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222222"; e.currentTarget.style.color = "#888888"; }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Regenerate
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[100, 85, 70].map((w, i) => (
            <div key={i} style={{ height: "14px", width: `${w}%`, background: "rgba(255,255,255,0.06)", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          <p style={{ color: "#555555", fontSize: "12px", marginTop: "4px" }}>
            Analyzing {coinName} market data...
          </p>
        </div>
      ) : error ? (
        <div style={{ color: "#888888", fontSize: "14px" }}>
          <p>Failed to generate summary.</p>
          <button onClick={() => fetchSummary()} style={{ marginTop: "8px", background: "transparent", border: "1px solid #222222", color: "#888888", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
            {summary}
          </p>
          {generatedAt && (
            <p style={{ color: "#555555", fontSize: "11px", marginTop: "12px", fontFamily: "monospace" }}>
              Generated {new Date(generatedAt).toLocaleString("en-US")}
            </p>
          )}
        </>
      )}
    </div>
  );
}