import { Schema, model, models, type Model, type Types } from "mongoose";

export type AuthProvider = "google" | "email";
export type SubscriptionStatus = "free" | "pro" | "pay_per_use" | "cancelled" | "past_due" | "trialing" | "incomplete";

export interface IUserProductUsage {
  productId: string;
  usageCount: number;
  lastUsed: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  image: string;
  provider: AuthProvider;
  passwordHash?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;
  usageCredits: number;
  products: IUserProductUsage[];
  createdAt: Date;
  updatedAt: Date;
}

const userProductUsageSchema = new Schema<IUserProductUsage>(
  {
    productId: { type: String, required: true, trim: true },
    usageCount: { type: Number, required: true, default: 0, min: 0 },
    lastUsed: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    provider: { type: String, enum: ["google", "email"], required: true },
    passwordHash: { type: String, required: false },
    stripeCustomerId: { type: String, required: false },
    stripeSubscriptionId: { type: String, required: false },
    subscriptionStatus: {
      type: String,
      enum: ["free", "pro", "pay_per_use", "cancelled", "past_due", "trialing", "incomplete"],
      default: "free",
      required: true,
    },
    usageCredits: { type: Number, default: 0, min: 0, required: true },
    products: { type: [userProductUsageSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

export const User: Model<IUser> =
  (models.User as Model<IUser> | undefined) ?? model<IUser>("User", userSchema);
