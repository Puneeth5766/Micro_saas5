import { redirect } from "next/navigation";
import { auth } from "../auth";
import { connectDB, User } from "@aether/db";
import type { IUserProductUsage, SubscriptionStatus } from "@aether/db";

export type AetherUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  subscriptionStatus: SubscriptionStatus;
  usageCredits: number;
};

export type UsageLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
};

function getMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getServerSession() {
  return auth();
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

export async function getServerUser(): Promise<AetherUser | null> {
  const session = await getServerSession();
  if (!session?.user?.id || !session.user.email || !session.user.name) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image ?? null,
    subscriptionStatus: session.user.subscriptionStatus,
    usageCredits: session.user.usageCredits
  };
}

export async function requireServerUser(): Promise<AetherUser> {
  const user = await getServerUser();
  if (!user) {
    redirect("/auth/signin");
  }

  return user;
}

export async function isSubscribed(userId: string): Promise<boolean> {
  await connectDB();
  const user = await User.findById(userId).select("subscriptionStatus").lean();
  return user?.subscriptionStatus === "pro";
}

export async function checkUsageLimit(userId: string, productId: string): Promise<UsageLimitResult> {
  await connectDB();

  const user = await User.findById(userId)
    .select("subscriptionStatus usageCredits products")
    .lean();

  if (!user) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  if (user.subscriptionStatus === "pro") {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, limit: Number.POSITIVE_INFINITY };
  }

  if (user.usageCredits > 0) {
    return { allowed: true, remaining: user.usageCredits, limit: user.usageCredits };
  }

  const monthlyLimit = 3;
  const monthStart = getMonthStart();
  const usage =
    user.products?.find((entry: IUserProductUsage) => {
      const lastUsed = new Date(entry.lastUsed);
      return entry.productId === productId && lastUsed >= monthStart;
    })?.usageCount ?? 0;

  const remaining = Math.max(monthlyLimit - usage, 0);

  return {
    allowed: remaining > 0,
    remaining,
    limit: monthlyLimit
  };
}
