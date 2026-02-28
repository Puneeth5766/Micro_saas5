import { connectDB, User } from "@aether/db";

type PlanTier = "free" | "pro" | "pay_per_use";

type RateCheckResult = {
  allowed: boolean;
  retryAfterMs?: number;
};

const WINDOW_MS = 60_000;
const LIMITS: Record<PlanTier, number> = {
  free: 5,
  pro: 60,
  pay_per_use: 20
};

export class RateLimiter {
  private readonly requests = new Map<string, number[]>();
  private readonly planCache = new Map<string, PlanTier>();

  check(userId: string, productId: string): RateCheckResult {
    const key = `${userId}:${productId}`;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    const current = this.requests.get(key) ?? [];
    const recent = current.filter((timestamp) => timestamp > windowStart);

    const tier = this.planCache.get(userId) ?? "free";
    const maxRequests = LIMITS[tier];

    if (recent.length >= maxRequests) {
      const oldest = recent[0] ?? now;
      const retryAfterMs = Math.max(0, WINDOW_MS - (now - oldest));
      this.requests.set(key, recent);
      return { allowed: false, retryAfterMs };
    }

    recent.push(now);
    this.requests.set(key, recent);
    return { allowed: true };
  }

  async hydrateUserTier(userId: string): Promise<void> {
    await connectDB();

    const user = await User.findById(userId).select("subscriptionStatus usageCredits").lean();
    if (!user) {
      this.planCache.set(userId, "free");
      return;
    }

    if (user.subscriptionStatus === "pro") {
      this.planCache.set(userId, "pro");
      return;
    }

    if (user.usageCredits > 0) {
      this.planCache.set(userId, "pay_per_use");
      return;
    }

    this.planCache.set(userId, "free");
  }
}

let singleton: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!singleton) {
    singleton = new RateLimiter();
  }

  return singleton;
}
