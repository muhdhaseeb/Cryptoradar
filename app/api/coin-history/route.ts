import { getCoinHistory } from "@/lib/coingecko";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get("coinId");

  if (!coinId) {
    return NextResponse.json({ error: "coinId is required" }, { status: 400 });
  }

  // parse days with explicit radix and validate
  const rawDays = searchParams.get("days") ?? "30";
  const parsedDays = parseInt(rawDays, 10);
  if (Number.isNaN(parsedDays) || parsedDays <= 0) {
    return NextResponse.json(
      { error: "Invalid 'days' parameter, must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const data = await getCoinHistory(coinId, parsedDays);
    return NextResponse.json(data);
  } catch (err) {
    // log a simple message, don't expose internal stack to clients
    console.error("Error fetching coin history in API route:", err);
    return NextResponse.json(
      { error: "Unable to fetch coin history" },
      { status: 502 }
    );
  }
}