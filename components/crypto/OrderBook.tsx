"use client";

interface Props {
  currentPrice: number;
}

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function OrderBook({ currentPrice }: Props) {
  const spread = currentPrice * 0.0001;

  const asks = Array.from({ length: 6 }, (_, i) => {
    const price = currentPrice + spread * (i + 1) * (1 + seededRand(i * 13) * 0.5);
    const size = parseFloat((seededRand(i * 7 + 1) * 5 + 0.2).toFixed(3));
    return { price, size };
  }).sort((a, b) => b.price - a.price);

  const bids = Array.from({ length: 6 }, (_, i) => {
    const price = currentPrice - spread * (i + 1) * (1 + seededRand(i * 11) * 0.5);
    const size = parseFloat((seededRand(i * 9 + 3) * 5 + 0.2).toFixed(3));
    return { price, size };
  }).sort((a, b) => b.price - a.price);

  const maxSize = Math.max(...asks.map((a) => a.size), ...bids.map((b) => b.size));

  return (
    <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "24px", marginTop: "16px" }}>
      <h2 style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#888888", marginBottom: "16px" }}>
        Order Book Overview
      </h2>

      <div style={{ fontFamily: "monospace", fontSize: "13px" }}>
        {asks.map((ask, i) => (
          <div key={i} style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(ask.size / maxSize) * 70}%`, background: "rgba(239,68,68,0.15)", borderRadius: "2px" }} />
            <span style={{ color: "#ef4444", position: "relative", zIndex: 1 }}>
              {ask.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ color: "#888888", position: "relative", zIndex: 1 }}>{ask.size.toFixed(3)}</span>
          </div>
        ))}

        <div style={{ textAlign: "center", padding: "8px 0", color: "#ffffff", fontWeight: 600, fontSize: "14px", borderTop: "1px solid #222222", borderBottom: "1px solid #222222", margin: "4px 0" }}>
          {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        {bids.map((bid, i) => (
          <div key={i} style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(bid.size / maxSize) * 70}%`, background: "rgba(0,196,140,0.15)", borderRadius: "2px" }} />
            <span style={{ color: "#00C48C", position: "relative", zIndex: 1 }}>
              {bid.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ color: "#888888", position: "relative", zIndex: 1 }}>{bid.size.toFixed(3)}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "10px", color: "#555555", marginTop: "12px", textAlign: "center" }}>
        Simulated order book — live data coming soon
      </p>
    </div>
  );
}