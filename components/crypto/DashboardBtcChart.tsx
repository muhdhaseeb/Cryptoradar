"use client";

import { useState } from "react";

interface Props {
  initialPrices: number[];
  currentPrice: number;
  priceChange: number;
}

const TIMEFRAMES = [
  { label: "1H", days: 1 },
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 2000 },
];

export default function DashboardBtcChart({ initialPrices, currentPrice, priceChange }: Props) {
  const [active, setActive] = useState("7D");
  const [prices, setPrices] = useState(initialPrices);
  const [loading, setLoading] = useState(false);

  async function handleTimeframe(label: string, days: number) {
    setActive(label);
    setLoading(true);
    try {
      const res = await fetch(`/api/coin-history?coinId=bitcoin&days=${days}`);
      if (res.ok) {
        const data = await res.json();
        const newPrices = (data?.prices ?? []).map(([, p]: [number, number]) => p);
        if (newPrices.length >= 2) setPrices(newPrices);
      }
    } catch (err) {
      console.error("Error fetching BTC history:", err);
    } finally {
      setLoading(false);
    }
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * 1000;
    const y = 270 - ((p - min) / range) * 260;
    return `${x},${y}`;
  });
  const pathD = "M" + points.join(" L") + " L1000,280 L0,280 Z";
  const lineD = "M" + points.join(" L");
  const lastY = 270 - ((prices[prices.length - 1] - min) / range) * 260;
  const isPositive = priceChange >= 0;

  return (
    <div style={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "4px" }}>
      {/* Header */}
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f7931a", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: "bold", color: "white" }}>
            ₿
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff" }}>Bitcoin</span>
              <span style={{ fontSize: "11px", color: "#888888", fontFamily: "monospace", border: "1px solid #222222", padding: "1px 6px", borderRadius: "2px" }}>BTC</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
              <span style={{ fontSize: "24px", fontWeight: 600, fontFamily: "monospace", color: "#ffffff" }}>
                ${currentPrice.toLocaleString("en-US")}
              </span>
              <span style={{ fontSize: "13px", fontFamily: "monospace", color: isPositive ? "#00C48C" : "#ef4444" }}>
                {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe buttons */}
        <div style={{ display: "flex", gap: "4px", backgroundColor: "#0a0a0a", padding: "2px", borderRadius: "4px", border: "1px solid #222222" }}>
          {TIMEFRAMES.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => handleTimeframe(label, days)}
              style={{
                background: active === label ? "#1a1a1a" : "transparent",
                border: "none",
                color: active === label ? "#ffffff" : "#888888",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 500,
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: "0 16px 16px", height: "280px", opacity: loading ? 0.4 : 1, transition: "opacity 0.2s" }}>
        {prices.length >= 2 ? (
          <svg width="100%" height="100%" viewBox="0 0 1000 280" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C48C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00C48C" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[70, 140, 210].map((y) => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#222222" strokeDasharray="4" />
            ))}
            <path d={pathD} fill="url(#chartGrad)" />
            <path d={lineD} fill="none" stroke="#00C48C" strokeWidth="2" />
            <circle cx={1000} cy={lastY} r="4" fill="white" stroke="#111111" strokeWidth="2" />
          </svg>
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#555555", fontSize: "13px" }}>
            Chart data unavailable
          </div>
        )}
      </div>
    </div>
  );
}