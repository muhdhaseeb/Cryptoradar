import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header
      style={{
        height: "56px",
        borderBottom: "1px solid #222222",
        backgroundColor: "#111111",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Left — Logo + Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
        {/* Logo */}
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "linear-gradient(135deg, #3b82f6, #00C48C)",
              borderRadius: "4px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#111111",
                borderRadius: "2px",
              }}
            />
          </div>
          CryptoRadar
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", gap: "24px" }}>
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Markets", href: "/markets" },
            { label: "Watchlist", href: "/watchlist" },
            { label: "Alerts", href: "/alerts" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "#888888",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right — Search + Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Search */}
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid #222222",
            borderRadius: "4px",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            width: "240px",
            gap: "8px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "#555555", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search coin, pair, or contract..."
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: "13px",
              width: "100%",
              outline: "none",
            }}
          />
        </div>

        {/* Clerk User Button */}
        <UserButton />
      </div>
    </header>
  );
}