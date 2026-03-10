"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatPercentage, formatNumber, Coin } from "@/lib/coingecko";
import WatchlistRemoveButton from "./WatchlistRemoveButton";

interface WatchlistCardProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  image: string;
  liveData?: Coin | null;
}

export default function WatchlistCard({ coinId, coinName, coinSymbol, image, liveData }: WatchlistCardProps) {
  const coin = liveData;
  const isPositive = (coin?.price_change_percentage_24h ?? 0) >= 0;
  const sparkPrices = coin?.sparkline_in_7d?.price ?? [];
  const sparkMin = sparkPrices.length > 0 ? Math.min(...sparkPrices) : 0;
  const sparkMax = sparkPrices.length > 0 ? Math.max(...sparkPrices) : 0;
  const sparkRange = sparkMax - sparkMin || 1;
  const sparkPoints = sparkPrices.length >= 2
    ? sparkPrices.map((p, i) => `${(i / (sparkPrices.length - 1)) * 200},${40 - ((p - sparkMin) / sparkRange) * 38}`).join(" ")
    : "";

  return (
    <div
      style={{ background: "#111111", border: "1px solid #222222", borderRadius: "4px", padding: "16px", transition: "border-color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#555555")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#222222")}
    >
      <Link href={`/coins/${coinId}`} style={{ textDecoration: "none" }}>
        {/* Coin header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {image ? (
              <Image src={image} alt={coinName} width={32} height={32} style={{ borderRadius: "50%" }} />
            ) : (
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#222222", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "bold", color: "#ffffff" }}>
                {coinSymbol && coinSymbol[0] ? coinSymbol[0] : coinName[0] || "?"}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff" }}>{coinName}</div>
              <div style={{ fontSize: "11px", color: "#888888", fontFamily: "monospace" }}>{coinSymbol}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#ffffff" }}>
              {coin ? formatPrice(coin.current_price) : "—"}
            </div>
            <div style={{ fontSize: "11px", fontFamily: "monospace", color: isPositive ? "#00C48C" : "#ef4444" }}>
              {coin ? formatPercentage(coin.price_change_percentage_24h) : "—"}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div style={{ width: "100%", height: "40px", marginTop: "16px" }}>
          {sparkPoints ? (
            <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
              <polyline points={sparkPoints} fill="none" stroke={isPositive ? "#00C48C" : "#ef4444"} strokeWidth="1.5" />
            </svg>
          ) : (
            <div style={{ height: "40px" }} />
          )}
        </div>

        {/* Stats footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #222222" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Market Cap</div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#ffffff" }}>
              {coin ? formatNumber(coin.market_cap) : "—"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vol 24h</div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#ffffff" }}>
              {coin ? formatNumber(coin.total_volume) : "—"}
            </div>
          </div>
        </div>
      </Link>

      {/* Remove button — outside Link to prevent navigation */}
      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #222222", display: "flex", justifyContent: "flex-end" }}>
        <WatchlistRemoveButton coinId={coinId} />
      </div>
    </div>
  );
}