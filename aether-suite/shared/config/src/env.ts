import { z } from "zod";

const optionalApiKey = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  },
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  MONGODB_URI: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRO_PRICE_ID: z.string().min(1),
  STRIPE_PRICE_RFP_TOOL_PACK_5: z.string().min(1),
  STRIPE_PRICE_RFP_TOOL_PACK_15: z.string().min(1),
  STRIPE_PRICE_COMPLIANCE_TOOL_PACK_10: z.string().min(1),
  STRIPE_PRICE_COMPLIANCE_TOOL_PACK_30: z.string().min(1),
  STRIPE_PRICE_MARKET_ANALYZER_PACK_5: z.string().min(1),
  STRIPE_PRICE_MARKET_ANALYZER_PACK_15: z.string().min(1),
  STRIPE_PRICE_PROPOSAL_OPTIMIZER_PACK_10: z.string().min(1),
  STRIPE_PRICE_PROPOSAL_OPTIMIZER_PACK_30: z.string().min(1),
  STRIPE_PRICE_LANDING_CRITIC_PACK_10: z.string().min(1),
  STRIPE_PRICE_LANDING_CRITIC_PACK_30: z.string().min(1),
  OPENAI_API_KEY: optionalApiKey,
  GEMINI_API_KEY: optionalApiKey,
  CLAUDE_API_KEY: optionalApiKey,
  DEFAULT_AI_PROVIDER: z.enum(["openai", "gemini", "claude"]).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env: Env = parsedEnv.data;
