import { env } from "@aether/config";
import { createOpenAI } from "@ai-sdk/openai";
import { AetherAIError } from "../resilience";

export const OPENAI_MODELS = {
  GPT4O: "gpt-4o",
  GPT4O_MINI: "gpt-4o-mini",
  GPT4_TURBO: "gpt-4-turbo"
} as const;

if (!env.OPENAI_API_KEY) {
  throw new AetherAIError({
    message: "OPENAI_API_KEY is required to initialize OpenAI provider.",
    provider: "openai",
    statusCode: 500,
    retryable: false
  });
}

export const openaiClient = createOpenAI({ apiKey: env.OPENAI_API_KEY });
