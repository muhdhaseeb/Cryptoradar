import mongoose, { Schema, Document } from "mongoose";

export interface IWatchlist extends Document {
  userId: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  image: string;
  addedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: String, required: true },
    coinId: { type: String, required: true },
    coinName: { type: String, required: true },
    coinSymbol: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent duplicate coins in watchlist for same user
WatchlistSchema.index({ userId: 1, coinId: 1 }, { unique: true });

export default mongoose.models.Watchlist ||
  mongoose.model<IWatchlist>("Watchlist", WatchlistSchema);