export type BillingPlan = "free" | "pro" | "pay_per_use";

export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing" | "incomplete";

export type ProductId =
  | "rfp-tool"
  | "compliance-tool"
  | "market-analyzer"
  | "proposal-optimizer"
  | "landing-critic";

export type CreditPack = {
  id: string;
  productId: ProductId;
  credits: number;
  price: number;
  stripePriceId: string;
};

export type BillingPortalSession = {
  url: string;
};

export type CheckoutSession = {
  url: string;
  sessionId: string;
};

export type UsageLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: BillingPlan;
};

export class BillingError extends Error {
  statusCode: number;
  code?: string;
  originalError?: unknown;

  constructor(params: { message: string; statusCode?: number; code?: string; originalError?: unknown }) {
    super(params.message);
    this.name = "BillingError";
    this.statusCode = params.statusCode ?? 500;
    this.code = params.code;
    this.originalError = params.originalError;
  }
}
