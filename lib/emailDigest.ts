import nodemailer from "nodemailer";
import { Coin } from "@/lib/coingecko";

// simple html escape helper to avoid injecting arbitrary characters
function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) => {
    switch (c) {
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
      default:
        return c;
    }
  });
}

let cachedTransporter: nodemailer.Transporter | null = null;

// escape values used inside HTML attributes (hrefs etc.)
function escapeAttribute(str: string) {
  return str.replace(/[&"<>]/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      default:
        return c;
    }
  });
}
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const user = process.env.NODEMAILER_EMAIL;
  const pass = process.env.NODEMAILER_PASSWORD;
  if (!user || !pass) {
    throw new Error("NODEMAILER_EMAIL and NODEMAILER_PASSWORD must be defined");
  }
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cachedTransporter;
}

export async function sendDailyDigestEmail({
  to,
  coins,
}: {
  to: string;
  coins: Coin[];
}) {
  const rows = coins
    .map((coin) => {
      // defensive defaults to avoid runtime errors
      const symbol = escapeHtml((coin.symbol ?? "").toUpperCase());
      const price = coin.current_price ?? 0;
      const change = coin.price_change_percentage_24h ?? 0;
      const isUp = change >= 0;
      return `
        <tr style="border-bottom: 1px solid #222222;">
          <td style="padding: 10px 0; font-weight: 600;">${symbol}</td>
          <td style="padding: 10px 0; font-family: monospace;">$${price.toLocaleString("en-US")}</td>
          <td style="padding: 10px 0; font-family: monospace; color: ${isUp ? "#00C48C" : "#ef4444"};">
            ${isUp ? "+" : ""}${change.toFixed(2)}%
          </td>
        </tr>
      `;
    })
    .join("");

  // read and validate base url once
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_BASE_URL is not defined, cannot build digest links");
    throw new Error("Missing NEXT_PUBLIC_BASE_URL");
  }
  try {
    new URL(baseUrl);
  } catch (err) {
    console.error("NEXT_PUBLIC_BASE_URL is not a valid URL", baseUrl);
    throw new Error("Invalid NEXT_PUBLIC_BASE_URL");
  }
  // attribute-safe version of baseUrl
  const safeBase = escapeAttribute(baseUrl);

  const html = `
    <div style="font-family: Inter, sans-serif; background: #0a0a0a; color: #ffffff; padding: 32px; max-width: 520px; margin: 0 auto; border-radius: 8px;">
      <div style="margin-bottom: 24px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #00C48C); border-radius: 8px; margin-bottom: 12px;"></div>
        <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin: 0;">CryptoRadar Daily Digest</h1>
        <p style="color: #888888; font-size: 13px; margin-top: 4px;">
          ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div style="background: #111111; border: 1px solid #222222; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 11px; font-weight: 600; color: #888888; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px 0;">
          Top 10 Coins — 24h Performance
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; font-size: 11px; color: #555555; padding-bottom: 8px; text-transform: uppercase;">Asset</th>
              <th style="text-align: left; font-size: 11px; color: #555555; padding-bottom: 8px; text-transform: uppercase;">Price</th>
              <th style="text-align: left; font-size: 11px; color: #555555; padding-bottom: 8px; text-transform: uppercase;">24h</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <a href="${safeBase}/dashboard"
        style="display: block; background: #3b82f6; color: white; text-align: center; padding: 12px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 24px;">
        Open CryptoRadar Dashboard →
      </a>

      <p style="font-size: 11px; color: #555555; text-align: center;">
        You're receiving this because you enabled daily digest emails in CryptoRadar.
        <br/>
        <a href="${safeBase}/settings" style="color: #3b82f6;">Manage notifications</a>
      </p>
    </div>
  `;

  const subject = `📊 CryptoRadar Daily Digest — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `CryptoRadar <${process.env.NODEMAILER_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // avoid logging raw email address; hash it for diagnostics
    let toId: string;
    try {
      const crypto = await import("crypto");
      toId = crypto.createHash("sha256").update(to).digest("hex").slice(0, 8);
    } catch {
      // fallback to simple masking if crypto import fails
      toId = to.replace(/(.).+(@.+)/, "$1***$2");
    }
    console.error("Error sending daily digest email", { toId, subject, error: err });
    // rethrow so callers can increment sent counter appropriately or handle
    throw err;
  }
}