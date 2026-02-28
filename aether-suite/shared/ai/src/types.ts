export type AIProvider = "openai" | "gemini" | "claude";

export type AIModel = string;

export type AetherAIRequest = {
  prompt: string;
  systemPrompt?: string;
  provider?: AIProvider;
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
  userId: string;
  productId: string;
  action: string;
};

export type AetherAIResponse = {
  text: string;
  provider: AIProvider;
  model: AIModel;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
  durationMs: number;
};

export type AetherStreamResponse = {
  stream: AsyncIterable<string>;
  metadata: Promise<Pick<AetherAIResponse, "provider" | "model" | "usage" | "cost" | "durationMs">>;
};
