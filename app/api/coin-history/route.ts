import { getCoinHistory } from "@/lib/coingecko";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get("coinId");
  const days = parseInt(searchParams.get("days") ?? "30");

  if (!coinId) return NextResponse.json(null, { status: 400 });

  const data = await getCoinHistory(coinId, days);
  return NextResponse.json(data);
}