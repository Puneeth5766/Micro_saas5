import type { AIProvider } from "../types";

type Pricing = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const PRICE_TABLE: Record<AIProvider, Record<string, Pricing>> = {
  openai: {
    "gpt-4o": { inputPerMillion: 5, outputPerMillion: 15 },
    "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
    "gpt-4-turbo": { inputPerMillion: 10, outputPerMillion: 30 }
  },
  gemini: {
    "gemini-2.5-flash": { inputPerMillion: 0.075, outputPerMillion: 0.3 },
    "gemini-2.5-pro": { inputPerMillion: 1.25, outputPerMillion: 10 },
    "gemini-2.0-flash": { inputPerMillion: 0.1, outputPerMillion: 0.4 }
  },
  claude: {
    "claude-sonnet-4-5": { inputPerMillion: 3, outputPerMillion: 15 },
    "claude-haiku-4-5": { inputPerMillion: 0.8, outputPerMillion: 4 }
  }
};

export function calculateCost(provider: AIProvider, model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICE_TABLE[provider][model];

  if (!pricing) {
    return 0;
  }

  const inputCost = (Math.max(inputTokens, 0) / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (Math.max(outputTokens, 0) / 1_000_000) * pricing.outputPerMillion;

  return Number((inputCost + outputCost).toFixed(8));
}
