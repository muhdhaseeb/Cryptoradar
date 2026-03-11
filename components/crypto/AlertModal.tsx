"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  currentPrice: number;
  onClose: () => void;
}

export default function AlertModal({ coinId, coinName, coinSymbol, currentPrice, onClose }: Props) {
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) {
      setError("Please enter a valid target price");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinId,
          coinName,
          coinSymbol,
          targetPrice: price,
          condition,
        }),
      });

      if (!res.ok) {
        // read full body once and try JSON.parse, else use as text
        let message = "Failed to create alert";
        const bodyText = await res.clone().text().catch(() => "");
        if (bodyText) {
          try {
            const data = JSON.parse(bodyText);
            if (data && data.error) message = data.error;
            else message = bodyText;
          } catch {
            message = bodyText;
          }
        } else if (res.statusText) {
          message = res.statusText;
        }
        throw new Error(message);
      }

      router.refresh();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#111111", border: "1px solid #222222", borderRadius: "8px", padding: "24px", width: "100%", maxWidth: "400px", margin: "16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Set Price Alert</h2>
            <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>
              {coinName} ({coinSymbol}) — Current: ${currentPrice.toLocaleString("en-US")}
            </p>
          </div>
          <button aria-label="Close dialog" title="Close" onClick={onClose} style={{ background: "transparent", border: "none", color: "#888888", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
        </div>

        {/* Condition */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            Condition
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {(["above", "below"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCondition(c)}
                style={{
                  padding: "10px",
                  borderRadius: "4px",
                  border: `1px solid ${condition === c ? (c === "above" ? "#00C48C" : "#ef4444") : "#222222"}`,
                  background: condition === c ? (c === "above" ? "rgba(0,196,140,0.1)" : "rgba(239,68,68,0.1)") : "transparent",
                  color: condition === c ? (c === "above" ? "#00C48C" : "#ef4444") : "#888888",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {c === "above" ? "↑ Rises Above" : "↓ Drops Below"}
              </button>
            ))}
          </div>
        </div>

        {/* Target Price */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            Target Price
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#555555" }}>$</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.00"
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #222222", color: "#ffffff", padding: "10px 10px 10px 24px", borderRadius: "4px", fontSize: "14px", fontFamily: "monospace", outline: "none" }}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "16px" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: "#3b82f6", color: "white", border: "none", padding: "12px", borderRadius: "4px", fontWeight: 600, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Creating..." : "Create Alert"}
        </button>
      </div>
    </div>
  );
}