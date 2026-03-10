import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Watchlist from "@/database/models/Watchlist";

// GET — fetch user's watchlist
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const items = await Watchlist.find({ userId }).lean();
  return NextResponse.json(items);
}

// POST — add coin to watchlist
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { coinId, coinName, coinSymbol, image } = body;
  if (!coinId || !coinName || !coinSymbol) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await Watchlist.findOne({ userId, coinId });
  if (existing) {
    return NextResponse.json({ error: "Already in watchlist" }, { status: 409 });
  }

  const item = await Watchlist.create({ userId, coinId, coinName, coinSymbol, image });
  return NextResponse.json(item, { status: 201 });
}

// DELETE — remove coin from watchlist
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { coinId } = body;
  if (!coinId) return NextResponse.json({ error: "Missing coinId" }, { status: 400 });

  await connectToDatabase();
  await Watchlist.findOneAndDelete({ userId, coinId });
  return NextResponse.json({ success: true });
}