"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Alert {
  _id: string;
  coinName: string;
  coinSymbol: string;
  condition: "above" | "below";
  targetPrice: number;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export default function AlertsTable({ alerts }: { alerts: Alert[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(alertId: string) {
    setDeleting(alertId);
    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      if (!res.ok) {
        let errMsg = `Delete failed (${res.status})`;
        try {
          const data = await res.json();
          if (data && data.error) errMsg = data.error;
        } catch {}
        console.error(errMsg);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error("Error deleting alert:", err);
    } finally {
      setDeleting(null);
    }
  }

  if (alerts.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", color: "#888888", fontSize: "14px" }}>
        No alerts yet — go to a coin page and click "Set Alert"
      </div>
    );
  }

  return (
    <div style={{ flexGrow: 1, overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Asset", "Condition", "Target", "Created", "Status", "Actions"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #222222" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => {
            const status = alert.triggeredAt ? "triggered" : alert.isActive ? "active" : "disabled";
            return (
              <tr key={alert._id} style={{ borderBottom: "1px solid #222222" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "20px", height: "20px", background: "#222222", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: "9px", fontWeight: "bold", color: "#ffffff" }}>
                      {alert.coinSymbol[0]}
                    </div>
                    <span style={{ fontWeight: 600 }}>{alert.coinSymbol}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#888888" }}>
                  Price {alert.condition === "above" ? "Rises Above" : "Drops Below"}
                </td>
                <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#ffffff" }}>
                  ${alert.targetPrice.toLocaleString("en-US")}
                </td>
                <td style={{ padding: "14px 16px", fontSize: "11px", color: "#555555", fontFamily: "monospace" }}>
                  {new Date(alert.createdAt).toLocaleDateString("en-US")}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: status === "active" ? "rgba(0,196,140,0.1)" : status === "triggered" ? "rgba(59,130,246,0.1)" : "rgba(136,136,136,0.1)",
                    color: status === "active" ? "#00C48C" : status === "triggered" ? "#3b82f6" : "#888888",
                    border: `1px solid ${status === "active" ? "rgba(0,196,140,0.2)" : status === "triggered" ? "rgba(59,130,246,0.2)" : "rgba(136,136,136,0.2)"}`,
                  }}>
                    {status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button
                    aria-label="Delete alert"
                    onClick={() => handleDelete(alert._id)}
                    disabled={deleting === alert._id}
                    style={{ background: "transparent", border: "none", color: "#555555", cursor: "pointer", opacity: deleting === alert._id ? 0.4 : 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#555555")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4h8v2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}