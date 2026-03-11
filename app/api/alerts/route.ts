import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Alert from "@/database/models/Alert";
import User from "@/database/models/User";
import mongoose from "mongoose";

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

// GET — fetch user's alerts
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const alerts = await Alert.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(alerts);
}

// POST — create alert
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { coinId, coinName, coinSymbol, targetPrice, condition } = body ?? {};

  if (
    !isNonEmptyString(coinId) ||
    !isNonEmptyString(coinName) ||
    !isNonEmptyString(coinSymbol) ||
    !isNonEmptyString(condition) ||
    !["above", "below"].includes(condition) ||
    typeof targetPrice !== "number" ||
    !isFinite(targetPrice) ||
    targetPrice <= 0
  ) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ clerkId: userId });
  if (!user?.email) {
    return NextResponse.json({ error: "User email not found" }, { status: 400 });
  }

  const alert = await Alert.create({
    userId,
    email: user.email,
    coinId,
    coinName,
    coinSymbol,
    targetPrice,
    condition,
    isActive: true,
  });

  return NextResponse.json(alert, { status: 201 });
}

// DELETE — delete alert
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { alertId } = body ?? {};

  if (!isNonEmptyString(alertId)) {
    return NextResponse.json({ error: "Missing alertId" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(alertId)) {
    return NextResponse.json({ error: "Invalid alertId" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const deleted = await Alert.findOneAndDelete({ _id: alertId, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Alert not found or not owned by user" }, { status: 404 });
    }
  } catch (err) {
    console.error("Error deleting alert:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}