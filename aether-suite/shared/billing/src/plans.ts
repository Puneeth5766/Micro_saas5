import { env } from "@aether/config";
import type { CreditPack, ProductId } from "./types";

function requirePriceId(value: string | undefined, envVarName: string): string {
  if (!value) {
    throw new Error(`Missing required Stripe price id env variable: ${envVarName}`);
  }

  return value;
}

const UNLIMITED = Number.POSITIVE_INFINITY;

const PAY_PER_USE_PACKS: Record<ProductId, CreditPack[]> = {
  "rfp-tool": [
    {
      id: "rfp-tool-pack-5",
      productId: "rfp-tool",
      credits: 5,
      price: 9,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_RFP_TOOL_PACK_5, "STRIPE_PRICE_RFP_TOOL_PACK_5")
    },
    {
      id: "rfp-tool-pack-15",
      productId: "rfp-tool",
      credits: 15,
      price: 19,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_RFP_TOOL_PACK_15, "STRIPE_PRICE_RFP_TOOL_PACK_15")
    }
  ],
  "compliance-tool": [
    {
      id: "compliance-tool-pack-10",
      productId: "compliance-tool",
      credits: 10,
      price: 5,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_COMPLIANCE_TOOL_PACK_10, "STRIPE_PRICE_COMPLIANCE_TOOL_PACK_10")
    },
    {
      id: "compliance-tool-pack-30",
      productId: "compliance-tool",
      credits: 30,
      price: 12,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_COMPLIANCE_TOOL_PACK_30, "STRIPE_PRICE_COMPLIANCE_TOOL_PACK_30")
    }
  ],
  "market-analyzer": [
    {
      id: "market-analyzer-pack-5",
      productId: "market-analyzer",
      credits: 5,
      price: 7,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_MARKET_ANALYZER_PACK_5, "STRIPE_PRICE_MARKET_ANALYZER_PACK_5")
    },
    {
      id: "market-analyzer-pack-15",
      productId: "market-analyzer",
      credits: 15,
      price: 15,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_MARKET_ANALYZER_PACK_15, "STRIPE_PRICE_MARKET_ANALYZER_PACK_15")
    }
  ],
  "proposal-optimizer": [
    {
      id: "proposal-optimizer-pack-10",
      productId: "proposal-optimizer",
      credits: 10,
      price: 5,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_PROPOSAL_OPTIMIZER_PACK_10, "STRIPE_PRICE_PROPOSAL_OPTIMIZER_PACK_10")
    },
    {
      id: "proposal-optimizer-pack-30",
      productId: "proposal-optimizer",
      credits: 30,
      price: 12,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_PROPOSAL_OPTIMIZER_PACK_30, "STRIPE_PRICE_PROPOSAL_OPTIMIZER_PACK_30")
    }
  ],
  "landing-critic": [
    {
      id: "landing-critic-pack-10",
      productId: "landing-critic",
      credits: 10,
      price: 5,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_LANDING_CRITIC_PACK_10, "STRIPE_PRICE_LANDING_CRITIC_PACK_10")
    },
    {
      id: "landing-critic-pack-30",
      productId: "landing-critic",
      credits: 30,
      price: 12,
      stripePriceId: requirePriceId(env.STRIPE_PRICE_LANDING_CRITIC_PACK_30, "STRIPE_PRICE_LANDING_CRITIC_PACK_30")
    }
  ]
};

export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    limits: {
      "rfp-tool": 3,
      "compliance-tool": 5,
      "market-analyzer": 3,
      "proposal-optimizer": 5,
      "landing-critic": 5
    }
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: 29,
    stripePriceId: requirePriceId(env.STRIPE_PRO_PRICE_ID, "STRIPE_PRO_PRICE_ID"),
    limits: {
      "rfp-tool": UNLIMITED,
      "compliance-tool": UNLIMITED,
      "market-analyzer": UNLIMITED,
      "proposal-optimizer": UNLIMITED,
      "landing-critic": UNLIMITED
    }
  },
  PAY_PER_USE: PAY_PER_USE_PACKS
} as const;
