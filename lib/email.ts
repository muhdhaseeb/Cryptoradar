import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const email = process.env.NODEMAILER_EMAIL;
  const pass = process.env.NODEMAILER_PASSWORD;
  if (!email || !pass) {
    throw new Error("MAILER configuration missing: NODEMAILER_EMAIL and NODEMAILER_PASSWORD must be set");
  }
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass },
  });
  return transporter;
}

function escapeHtml(str: string) {
  // regex now includes forward slash to match case below
  return str.replace(/[&<>"'\/]/g, (s) => {
    switch (s) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      case "/":
        return "&#x2F;";
      default:
        return s;
    }
  });
}

export async function sendAlertEmail({
  to,
  coinId,
  coinName,
  coinSymbol,
  condition,
  targetPrice,
  currentPrice,
}: {
  to: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  condition: "above" | "below";
  targetPrice: number;
  currentPrice: number;
}) {
  const subject = `🚨 CryptoRadar Alert: ${coinSymbol} ${condition === "above" ? "rose above" : "dropped below"} $${
    targetPrice.toLocaleString("en-US")
  }`;

  const html = `
    <div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #ffffff; padding: 32px; max-width: 480px; margin: 0 auto; border-radius: 8px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #00C48C); border-radius: 8px;"></div>
        <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">CryptoRadar</span>
      </div>

      <div style="background: #111111; border: 1px solid #222222; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
        <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Alert Triggered
        </div>
        <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px;">
          ${escapeHtml(coinName)} (${escapeHtml(coinSymbol)})
        </div>
        <div style="font-size: 14px; color: #888888; margin-bottom: 16px;">
          Price ${condition === "above" ? "rose above" : "dropped below"} your target
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 11px; color: #888888; text-transform: uppercase; margin-bottom: 4px;">Target Price</div>
            <div style="font-family: monospace; font-size: 18px; color: ${condition === "above" ? "#00C48C" : "#ef4444"};">
              $${escapeHtml(targetPrice.toLocaleString("en-US"))}
            </div>
          </div>
          <div>
            <div style="font-size: 11px; color: #888888; text-transform: uppercase; margin-bottom: 4px;">Current Price</div>
            <div style="font-family: monospace; font-size: 18px; color: #ffffff;">
              $${escapeHtml(currentPrice.toLocaleString("en-US"))}
            </div>
          </div>
        </div>
      </div>

      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/coins/${encodeURIComponent(
        coinId
      )}"
        style="display: block; background: #3b82f6; color: white; text-align: center; padding: 12px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View ${escapeHtml(coinSymbol)} on CryptoRadar →
      </a>

      <div style="margin-top: 24px; font-size: 11px; color: #555555; text-align: center;">
        You're receiving this because you set a price alert on CryptoRadar.
      </div>
    </div>
  `;

  await getTransporter().sendMail({
    from: `CryptoRadar <${process.env.NODEMAILER_EMAIL}>`,
    to,
    subject,
    html,
  });
}