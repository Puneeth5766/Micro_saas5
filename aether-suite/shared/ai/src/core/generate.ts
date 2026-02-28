import { generateText } from "ai";
import { getProvider } from "../providers";
import { getCircuitBreaker, mapProviderError, withRetry } from "../resilience";
import type { AetherAIRequest, AetherAIResponse } from "../types";
import { calculateCost } from "./cost";

export async function generateAI(request: AetherAIRequest): Promise<AetherAIResponse> {
  const resolved = getProvider(request.provider);
  const model = request.model ?? resolved.defaultModel;

  const messages = [
    ...(request.systemPrompt ? [{ role: "system" as const, content: request.systemPrompt }] : []),
    { role: "user" as const, content: request.prompt }
  ];

  const startTime = Date.now();

  const circuitBreaker = getCircuitBreaker(resolved.provider);

  const result = await circuitBreaker.execute(async () =>
    withRetry(async () => {
      try {
        return await generateText({
          model: resolved.client(model),
          messages,
          maxTokens: request.maxTokens,
          temperature: request.temperature
        });
      } catch (error) {
        throw mapProviderError(resolved.provider, error, model);
      }
    }, { provider: resolved.provider })
  );

  const endTime = Date.now();

  const inputTokens = result.usage?.inputTokens ?? 0;
  const outputTokens = result.usage?.outputTokens ?? 0;
  const totalTokens = inputTokens + outputTokens;

  return {
    text: result.text,
    provider: resolved.provider,
    model,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens
    },
    cost: calculateCost(resolved.provider, model, inputTokens, outputTokens),
    durationMs: endTime - startTime
  };
}
