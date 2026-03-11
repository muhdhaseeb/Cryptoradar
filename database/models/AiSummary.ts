import mongoose, { Schema, Document } from "mongoose";

export interface IAiSummary extends Document {
  coinId: string;
  summary: string;
  generatedAt: Date;
}

const AiSummarySchema = new Schema<IAiSummary>({
  coinId: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  generatedAt: { type: Date, required: true },
});

export default mongoose.models.AiSummary ||
  mongoose.model<IAiSummary>("AiSummary", AiSummarySchema);