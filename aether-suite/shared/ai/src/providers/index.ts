import { env } from "@aether/config";
import type { LanguageModelV1 } from "ai";
import type { AIProvider } from "../types";
import { AetherAIError } from "../resilience";
import { claudeClient, CLAUDE_MODELS } from "./claude";
import { geminiClient, GEMINI_MODELS } from "./gemini";
import { openaiClient, OPENAI_MODELS } from "./openai";

export type ProviderResolution = {
  provider: AIProvider;
  client: (modelId: string) => LanguageModelV1;
  defaultModel: string;
};

const providerMap: Record<AIProvider, ProviderResolution> = {
  openai: {
    provider: "openai",
    client: openaiClient,
    defaultModel: OPENAI_MODELS.GPT4O_MINI
  },
  gemini: {
    provider: "gemini",
    client: geminiClient,
    defaultModel: GEMINI_MODELS.GEMINI_25_FLASH
  },
  claude: {
    provider: "claude",
    client: claudeClient,
    defaultModel: CLAUDE_MODELS.CLAUDE_SONNET
  }
};

export const DEFAULT_PROVIDER: AIProvider =
  env.DEFAULT_AI_PROVIDER === "gemini" ||
  env.DEFAULT_AI_PROVIDER === "claude" ||
  env.DEFAULT_AI_PROVIDER === "openai"
    ? env.DEFAULT_AI_PROVIDER
    : "openai";

export function getProvider(provider: AIProvider = DEFAULT_PROVIDER): ProviderResolution {
  const selected = providerMap[provider];

  if (!selected) {
    throw new AetherAIError({
      message: `Unsupported AI provider: ${provider}`,
      provider,
      statusCode: 400,
      retryable: false
    });
  }

  return selected;
}
