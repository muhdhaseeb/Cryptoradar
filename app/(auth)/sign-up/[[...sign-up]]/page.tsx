import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div
      className="onboarding-grid"
      style={{
        backgroundColor: "#0a0a0a",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Left — Features Pane */}
      <section
        className="features-pane-inner"
        style={{
          position: "relative",
          background: "radial-gradient(circle at 0% 0%, #151515 0%, #0a0a0a 100%)",
          borderRight: "1px solid #222222",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
          @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .ticker-row { animation: ticker 30s linear infinite; display: flex; white-space: nowrap; gap: 40px; }
          .ticker-row-reverse { animation: ticker 40s linear infinite reverse; display: flex; white-space: nowrap; gap: 40px; }
          .ticker-row-fast { animation: ticker 25s linear infinite; display: flex; white-space: nowrap; gap: 40px; }
          .feature-card-hover { transition: transform 0.3s ease; }
          .feature-card-hover:hover { transform: translateX(10px); border-color: #555555 !important; }
          .onboarding-grid {
            display: grid;
            grid-template-columns: 1fr 500px;
            height: 100vh;
          }
          .features-pane-inner { padding: 32px 80px; }
          .auth-pane-inner { padding: 0 60px; }
          @media (max-width: 900px) {
            .onboarding-grid {
              grid-template-columns: 1fr;
              grid-template-rows: auto 1fr;
              height: auto;
              min-height: 100vh;
              overflow-y: auto;
            }
            .features-pane-inner { padding: 32px 24px; }
            .features-pane-inner .feature-card-hover { display: none; }
            .auth-pane-inner { padding: 32px 24px; min-height: 100vh; }
          }
          @media (prefers-reduced-motion: reduce) {
            .ticker-row, .ticker-row-reverse, .ticker-row-fast { animation: none; }
          }
        `}</style>

        {/* Animated ticker */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0, left: 0, width: "100%", height: "100%",
            pointerEvents: "none", opacity: 0.15, zIndex: 0,
            display: "flex", flexDirection: "column", gap: "20px",
            paddingTop: "20px", transform: "rotate(-5deg) scale(1.1)",
          }}
        >
          <div className="ticker-row">
            {["BTC $67,240 +4.2%", "ETH $3,450 +2.1%", "SOL $184 +12.5%", "BNB $580 -1.4%",
              "BTC $67,240 +4.2%", "ETH $3,450 +2.1%", "SOL $184 +12.5%", "BNB $580 -1.4%"].map((t, i) => (
              <span key={i} style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: 700, color: "#888888", flexShrink: 0 }}>{t}</span>
            ))}
          </div>
          <div className="ticker-row-reverse">
            {["XRP $0.62 +0.5%", "ADA $0.45 -3.2%", "AVAX $54 +8.1%", "DOGE $0.16 -5.4%",
              "XRP $0.62 +0.5%", "ADA $0.45 -3.2%", "AVAX $54 +8.1%", "DOGE $0.16 -5.4%"].map((t, i) => (
              <span key={i} style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: 700, color: "#888888", flexShrink: 0 }}>{t}</span>
            ))}
          </div>
          <div className="ticker-row-fast">
            {["LINK $18 +5.4%", "PEPE $0.000008 -8.1%", "FET $2.44 +5.2%", "RNDR $10 +8.4%",
              "LINK $18 +5.4%", "PEPE $0.000008 -8.1%", "FET $2.44 +5.2%", "RNDR $10 +8.4%"].map((t, i) => (
              <span key={i} style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: 700, color: "#888888", flexShrink: 0 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Features content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
          {/* Logo */}
          <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-1px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "60px" }}>
            <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #3b82f6, #00C48C)", borderRadius: "8px", display: "grid", placeItems: "center" }}>
              <div style={{ width: "20px", height: "20px", background: "#0a0a0a", borderRadius: "4px" }} />
            </div>
            CryptoRadar
          </div>

          {/* Feature cards */}
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>, color: "#3b82f6", title: "Professional Terminal", desc: "Advanced charting, real-time order books, and global market heatmaps in a single high-performance view.", badge: null },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, color: "#00C48C", title: "AI Market Intelligence", desc: "Proprietary AI summaries that distill complex price action and on-chain data into actionable insights.", badge: "NEW" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, color: "#f59e0b", title: "Smart Multi-Channel Alerts", desc: "Set complex triggers based on price, volume, and technical indicators. Get notified instantly.", badge: null },
          ].map((f, i) => (
            <div key={i} className="feature-card-hover" style={{ background: "rgba(17,17,17,0.8)", backdropFilter: "blur(8px)", border: "1px solid #222222", borderRadius: "6px", padding: "24px", marginBottom: "16px", display: "flex", gap: "24px" }}>
              <div style={{ width: "40px", height: "40px", flexShrink: 0, borderRadius: "4px", background: "#1a1a1a", display: "grid", placeItems: "center", color: f.color }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                  {f.title}
                  {f.badge && <span style={{ background: "#00C48C", color: "#0a0a0a", fontSize: "9px", fontWeight: 800, padding: "1px 4px", borderRadius: "2px", marginLeft: "6px", textTransform: "uppercase" as const, verticalAlign: "middle" as const }}>{f.badge}</span>}
                </h3>
                <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Right — Clerk SignUp */}
      <section
        className="auth-pane-inner"
        style={{
          backgroundColor: "#111111",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ marginBottom: "32px", width: "100%" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "8px" }}>
            Create your account
          </h1>
          <p style={{ color: "#888888", fontSize: "14px" }}>
            Join 50,000+ traders scanning the markets with Radar.
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: { width: "100%" },
              card: { background: "transparent", border: "none", boxShadow: "none", padding: 0, width: "100%" },
              headerTitle: { display: "none" },
              headerSubtitle: { display: "none" },
              footer: { display: "none" },
              badge: { display: "none" },
              socialButtonsBlockButton: { background: "#0a0a0a", border: "1px solid #222222", color: "#ffffff", fontSize: "13px" },
              dividerLine: { background: "#222222" },
              dividerText: { color: "#555555" },
              formFieldInput: { background: "#0a0a0a", border: "1px solid #222222", color: "#ffffff", fontSize: "14px" },
              formFieldLabel: { color: "#888888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" },
              formButtonPrimary: { background: "#ffffff", color: "#0a0a0a", fontSize: "14px", fontWeight: 600 },
              footerActionLink: { color: "#3b82f6" },
            },
          }}
        />

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#888888", width: "100%" }}>
          Already have an account?{" "}
          <Link href="/sign-in" style={{ color: "#ffffff", fontWeight: 500, textDecoration: "none" }}>
            Log in
          </Link>
        </div>

      </section>
    </div>
  );
}
