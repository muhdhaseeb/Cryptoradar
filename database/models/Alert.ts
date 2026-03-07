import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
  userId: string;
  email: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    coinId: { type: String, required: true },
    coinName: { type: String, required: true },
    coinSymbol: { type: String, required: true },
    targetPrice: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) => value > 0 && isFinite(value),
        message: "targetPrice must be a positive finite number",
      },
    },
    condition: {
      type: String,
      enum: ["above", "below"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    triggeredAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ userId: 1 });

export default mongoose.models.Alert ||
  mongoose.model<IAlert>("Alert", AlertSchema);