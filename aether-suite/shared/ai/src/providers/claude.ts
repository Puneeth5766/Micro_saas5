import { env } from "@aether/config";
import { createAnthropic } from "@ai-sdk/anthropic";
import { AetherAIError } from "../resilience";

export const CLAUDE_MODELS = {
  CLAUDE_SONNET: "claude-sonnet-4-5",
  CLAUDE_HAIKU: "claude-haiku-4-5"
} as const;

if (!env.CLAUDE_API_KEY) {
  throw new AetherAIError({
    message: "CLAUDE_API_KEY is required to initialize Claude provider.",
    provider: "claude",
    statusCode: 500,
    retryable: false
  });
}

export const claudeClient = createAnthropic({ apiKey: env.CLAUDE_API_KEY });
