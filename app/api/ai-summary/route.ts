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

  // safely access nested market data with optional chaining and sensible defaults
  const price = coin.market_data?.current_price?.usd ?? 0;
  const change24h = coin.market_data?.price_change_percentage_24h ?? 0;
  const change7d = coin.market_data?.price_change_percentage_7d ?? 0;
  const marketCap = coin.market_data?.market_cap?.usd ?? 0;
  const volume = coin.market_data?.total_volume?.usd ?? 0;
  const ath = coin.market_data?.ath?.usd ?? 0;
  const athChange = coin.market_data?.ath_change_percentage?.usd ?? 0;

  // basic validation: we at least need a non-zero price to generate anything useful
  if (!coin.market_data || price === 0) {
    if (cached) {
      // if we already have any cached summary (fresh or stale), return it instead
      return NextResponse.json({
        summary: cached.summary,
        generatedAt: cached.generatedAt,
        warning: "Using cached summary because market data is unavailable or incomplete",
      });
    }
    return NextResponse.json(
      { error: "Insufficient market data to generate AI summary" },
      { status: 400 }
    );
  }

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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    // keep one timestamp value so cache/response stay in sync
    const generatedAt = new Date();

    // Upsert cache
    await AiSummary.findOneAndUpdate(
      { coinId },
      { summary, generatedAt },
      { upsert: true, new: true }
    );

    return NextResponse.json({ summary, generatedAt });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}