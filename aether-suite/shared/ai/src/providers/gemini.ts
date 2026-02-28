import { env } from "@aether/config";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AetherAIError } from "../resilience";

export const GEMINI_MODELS = {
  GEMINI_25_FLASH: "gemini-2.5-flash",
  GEMINI_25_PRO: "gemini-2.5-pro",
  GEMINI_20_FLASH: "gemini-2.0-flash"
} as const;

if (!env.GEMINI_API_KEY) {
  throw new AetherAIError({
    message: "GEMINI_API_KEY is required to initialize Gemini provider.",
    provider: "gemini",
    statusCode: 500,
    retryable: false
  });
}

export const geminiClient = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
