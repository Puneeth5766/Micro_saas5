import { PRODUCTS } from "@aether/config";
import { Schema, model, models, type Model, type Types } from "mongoose";

const PRODUCT_IDS = PRODUCTS.map((product) => product.id) as [string, ...string[]];

export type AnalyticsCategory =
  | "navigation"
  | "ai"
  | "billing"
  | "auth"
  | "feature"
  | "error";

export interface IAnalyticsEvent {
  _id: Types.ObjectId;
  userId?: string;
  sessionId: string;
  productId: (typeof PRODUCT_IDS)[number];
  event: string;
  category: AnalyticsCategory;
  properties: Record<string, unknown>;
  page: string;
  userAgent: string;
  country?: string;
  createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: { type: String, required: false, index: true, trim: true },
    sessionId: { type: String, required: true, trim: true, index: true },
    productId: { type: String, required: true, enum: PRODUCT_IDS, trim: true, index: true },
    event: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ["navigation", "ai", "billing", "auth", "feature", "error"],
    },
    properties: { type: Schema.Types.Mixed, required: true, default: {} },
    page: { type: String, required: true, trim: true },
    userAgent: { type: String, required: true, trim: true },
    country: { type: String, required: false, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    minimize: false,
  },
);

analyticsEventSchema.index({ userId: 1, productId: 1, event: 1, createdAt: -1 });

export const AnalyticsEvent: Model<IAnalyticsEvent> =
  (models.AnalyticsEvent as Model<IAnalyticsEvent> | undefined) ??
  model<IAnalyticsEvent>("AnalyticsEvent", analyticsEventSchema);
