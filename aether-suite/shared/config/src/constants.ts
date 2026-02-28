export const AETHER_SUITE_NAME = "Aether AI Business Suite" as const;

export type Product = {
  id: "rfp-tool" | "compliance-tool" | "market-analyzer" | "proposal-optimizer" | "landing-critic";
  name: string;
  slug: string;
};

export const PRODUCTS: readonly Product[] = [
  { id: "rfp-tool", name: "RFP Tool", slug: "rfp-tool" },
  { id: "compliance-tool", name: "Compliance Tool", slug: "compliance-tool" },
  { id: "market-analyzer", name: "Market Analyzer", slug: "market-analyzer" },
  { id: "proposal-optimizer", name: "Proposal Optimizer", slug: "proposal-optimizer" },
  { id: "landing-critic", name: "Landing Critic", slug: "landing-critic" },
] as const;

export const AI_PROVIDERS = ["openai", "gemini", "claude"] as const;

export type AIProvider = (typeof AI_PROVIDERS)[number];

export const DEFAULT_AI_PROVIDER: AIProvider = "openai";

export type StripePlanKey = "FREE" | "PRO" | "PAY_PER_USE";

export type StripePlanConfig = {
  id: StripePlanKey;
  name: string;
  priceId: string;
};

export const STRIPE_PLANS: Readonly<Record<StripePlanKey, StripePlanConfig>> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceId: "price_free_placeholder",
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceId: "price_pro_placeholder",
  },
  PAY_PER_USE: {
    id: "PAY_PER_USE",
    name: "Pay Per Use",
    priceId: "price_ppu_placeholder",
  },
};
