import { connectDB, UsageLog, User } from "@aether/db";
import type { IUserProductUsage } from "@aether/db";
import type { AIProvider } from "../types";

type TrackUsageParams = {
  userId: string;
  productId: string;
  action: string;
  provider: AIProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
};

export async function trackUsage(params: TrackUsageParams): Promise<void> {
  await connectDB();

  const tokensUsed = Math.max(0, params.inputTokens) + Math.max(0, params.outputTokens);

  await UsageLog.create({
    userId: params.userId,
    productId: params.productId,
    action: `${params.action}:${params.model}`,
    tokensUsed,
    provider: params.provider,
    cost: Math.max(0, params.cost)
  });

  const user = await User.findById(params.userId).select("subscriptionStatus usageCredits products");

  if (!user) {
    return;
  }

  const usageEntry = user.products.find((entry: IUserProductUsage) => entry.productId === params.productId);

  if (usageEntry) {
    usageEntry.usageCount += 1;
    usageEntry.lastUsed = new Date();
  } else {
    user.products.push({
      productId: params.productId,
      usageCount: 1,
      lastUsed: new Date()
    });
  }

  if (user.subscriptionStatus !== "pro" && user.usageCredits > 0) {
    user.usageCredits = Math.max(0, user.usageCredits - 1);
  }

  await user.save();
}
