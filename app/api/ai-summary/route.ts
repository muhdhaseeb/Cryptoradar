import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AiSummary from "@/database/models/AiSummary";
import { getCoinDetail } from "@/lib/coingecko";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const coinId = request.nextUrl.searchParams.get("coinId");
  if (!coinId) return NextResponse.json({ error: "Missing coinId" }, { status: 400 });

  await connectToDatabase();

  // Return cached summary if fresh
  const cached = await AiSummary.findOne({ coinId });
  if (cached && Date.now() - cached.generatedAt.getTime() < CACHE_DURATION_MS) {
    return NextResponse.json({ summary: cached.summary, generatedAt: cached.generatedAt });
  }

  // Fetch coin data for context
  const coin = await getCoinDetail(coinId);
  if (!coin) return NextResponse.json({ error: "Coin not found" }, { status: 404 });

  const price = coin.market_data.current_price.usd;
  const change24h = coin.market_data.price_change_percentage_24h ?? 0;
  const change7d = coin.market_data.price_change_percentage_7d ?? 0;
  const marketCap = coin.market_data.market_cap.usd;
  const volume = coin.market_data.total_volume.usd;
  const ath = coin.market_data.ath.usd;
  const athChange = coin.market_data.ath_change_percentage.usd ?? 0;

  const prompt = `You are a professional crypto market analyst. Write a concise 3-paragraph market summary for ${coin.name} (${coin.symbol.toUpperCase()}) based on the following data:

- Current Price: $${price.toLocaleString("en-US")}
- 24h Change: ${change24h.toFixed(2)}%
- 7d Change: ${change7d.toFixed(2)}%
- Market Cap: $${(marketCap / 1_000_000_000).toFixed(2)}B
- 24h Volume: $${(volume / 1_000_000_000).toFixed(2)}B
- All Time High: $${ath.toLocaleString("en-US")} (${athChange.toFixed(1)}% from ATH)
- Market Cap Rank: #${coin.market_cap_rank}

Write in a professional but accessible tone. Focus on:
1. Current price action and momentum
2. Volume and market activity
3. Overall market position and outlook

Keep it under 120 words. Do not use bullet points. Do not start with "${coin.name} is".`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    // Upsert cache
    await AiSummary.findOneAndUpdate(
      { coinId },
      { summary, generatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ summary, generatedAt: new Date() });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}