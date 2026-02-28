import { Schema, model, models, type Model, type Types } from "mongoose";

export type AIProvider = "openai" | "gemini" | "claude";

export interface IUsageLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: string;
  action: string;
  tokensUsed: number;
  provider: AIProvider;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

const usageLogSchema = new Schema<IUsageLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: String, required: true, trim: true, index: true },
    action: { type: String, required: true, trim: true },
    tokensUsed: { type: Number, required: true, min: 0 },
    provider: {
      type: String,
      enum: ["openai", "gemini", "claude"],
      required: true,
    },
    cost: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  },
);

export const UsageLog: Model<IUsageLog> =
  (models.UsageLog as Model<IUsageLog> | undefined) ?? model<IUsageLog>("UsageLog", usageLogSchema);
