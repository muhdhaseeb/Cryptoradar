"use client";

import { useState, useRef } from "react";

interface Props {
  coinId: string;
  initialHistory: { prices: [number, number][] } | null;
}

const TIMEFRAMES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
];

export default function CoinChart({ coinId, initialHistory }: Props) {
  const [active, setActive] = useState("1M");
  const [history, setHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);
  const abortCtrl = useRef<AbortController | null>(null);

  async function handleTimeframe(label: string, days: number) {
    setActive(label);
    setLoading(true);

    // cancel any in-flight request before starting a new one
    if (abortCtrl.current) {
      abortCtrl.current.abort();
    }
    const controller = new AbortController();
    abortCtrl.current = controller;

    try {
      const res = await fetch(
        `/api/coin-history?coinId=${coinId}&days=${days}`,
        { signal: controller.signal }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setHistory(data);
    } catch (err: any) {
      if (err.name === "AbortError") {
        // request was superseded; nothing to do
      } else {
        console.error("Error fetching history:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  const prices = history?.prices ?? [];
  const values = prices.map(([, p]) => p);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((p, i) => {
    const x = (i / (values.length - 1)) * 800;
    const y = 280 - ((p - min) / range) * 260;
    return `${x},${y}`;
  });

  const linePath = points.length >= 2 ? "M" + points.join(" L") : "";
  const fillPath = points.length >= 2
    ? linePath + ` L800,300 L0,300 Z`
    : "";

  const isPositive = values.length >= 2 && values[values.length - 1] >= values[0];

  return (
    <div>
      {/* Timeframe buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div style={{ display: "flex", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "2px" }}>
          {TIMEFRAMES.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => handleTimeframe(label, days)}
              style={{
                background: active === label ? "#1a1a1a" : "transparent",
                border: "none",
                color: active === label ? "#ffffff" : "#94a3b8",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "2px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "320px", width: "100%", position: "relative", opacity: loading ? 0.4 : 1, transition: "opacity 0.2s" }}>
        {points.length >= 2 ? (
          <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="coinChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "#00C48C" : "#ef4444"} stopOpacity="0.2" />
                <stop offset="100%" stopColor={isPositive ? "#00C48C" : "#ef4444"} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[60, 150, 240].map((y) => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
            ))}

            <path d={fillPath} fill="url(#coinChartGrad)" />
            <path d={linePath} fill="none" stroke={isPositive ? "#00C48C" : "#ef4444"} strokeWidth="2" />
            <circle
              cx={800}
              cy={280 - ((values[values.length - 1] - min) / range) * 260}
              r="4"
              fill="#111111"
              stroke={isPositive ? "#00C48C" : "#ef4444"}
              strokeWidth="2"
            />
          </svg>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "14px" }}>
            No chart data available
          </div>
        )}
      </div>
    </div>
  );
}