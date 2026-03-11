import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Alert from "@/database/models/Alert";
import AlertsTable from "@/components/crypto/AlertsTable";
import Link from "next/link";

import type { Alert as AlertType } from "@/lib/types/alert";

export default async function AlertsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let alerts: AlertType[] = [];
  let activeAlerts: AlertType[] = [];
  let triggeredAlerts: AlertType[] = [];

  try {
    await connectToDatabase();

    const rawAlerts = await Alert.find({ userId }).sort({ createdAt: -1 }).lean();
    alerts = JSON.parse(JSON.stringify(rawAlerts)) as AlertType[];
    activeAlerts = alerts.filter((a) => a.isActive && !a.triggeredAt);
    triggeredAlerts = alerts.filter((a) => a.triggeredAt);
  } catch (err) {
    console.error("Failed to load alerts:", err);
    return (
      <div className="p-8 text-center text-red-500">Unable to load alerts. Please try again later.</div>
    );
  }

  return (
    <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(260px,380px) 1fr minmax(200px,320px)",
        gap: "16px",
        padding: "16px",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}>

      {/* Left — Create Alert + Stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        {/* Create Alert */}
        <div style={{ background: "#111111", border: "1px solid #222222", borderRadius: "4px" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #222222" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Create New Alert
            </span>
          </div>
          <div style={{ padding: "16px", fontSize: "13px", color: "#888888", lineHeight: 1.6 }}>
            <p>Go to any coin page and click <strong style={{ color: "#ffffff" }}>"Set Alert"</strong> to create a price alert.</p>
            <Link href="/dashboard" style={{ display: "inline-block", marginTop: "16px", background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>
              Browse Coins →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: "#111111", border: "1px solid #222222", borderRadius: "4px" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #222222" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Alert Stats
            </span>
          </div>
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Active Alerts", value: activeAlerts.length, color: "#ffffff" },
              { label: "Triggered (Total)", value: triggeredAlerts.length, color: "#00C48C" },
              { label: "Total Alerts", value: alerts.length, color: "#ffffff" },
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</span>
                <span style={{ fontFamily: "monospace", color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center — Alerts Table */}
      <div style={{ background: "#111111", border: "1px solid #222222", borderRadius: "4px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #222222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Manage Active Alerts
          </span>
        </div>
        <AlertsTable alerts={alerts} />
      </div>

      {/* Right — Trigger History */}
      <div style={{ background: "#111111", border: "1px solid #222222", borderRadius: "4px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #222222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Trigger History
          </span>
        </div>
        <div style={{ padding: "16px", overflowY: "auto", flexGrow: 1 }}>
          {triggeredAlerts.length === 0 ? (
            <p style={{ color: "#888888", fontSize: "13px" }}>No alerts triggered yet</p>
          ) : (
            triggeredAlerts.map((alert) => (
              <div key={alert._id} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid #222222" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#555555" }}>
                    {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString("en-US") : ""}
                  </span>
                  <span style={{ fontSize: "11px", color: alert.condition === "above" ? "#00C48C" : "#ef4444" }}>
                    Triggered
                  </span>
                </div>
                <div style={{ fontSize: "12px" }}>
                  <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: alert.condition === "above" ? "#00C48C" : "#ef4444", marginRight: "6px", verticalAlign: "middle" }} />
                  <strong>{alert.coinSymbol}</strong>
                  {" "}{alert.condition === "above" ? "rose above" : "dropped below"}{" "}
                  <span style={{ fontFamily: "monospace" }}>${alert.targetPrice.toLocaleString("en-US")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}