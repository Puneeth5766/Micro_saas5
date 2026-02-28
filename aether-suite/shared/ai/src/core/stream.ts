import { streamText } from "ai";
import { getProvider } from "../providers";
import type { AetherAIRequest, AetherStreamResponse } from "../types";
import { calculateCost } from "./cost";

export async function streamAI(request: AetherAIRequest): Promise<AetherStreamResponse> {
  const resolved = getProvider(request.provider);
  const model = request.model ?? resolved.defaultModel;

  const messages = [
    ...(request.systemPrompt ? [{ role: "system" as const, content: request.systemPrompt }] : []),
    { role: "user" as const, content: request.prompt }
  ];

  const startTime = Date.now();

  const result = streamText({
    model: resolved.client(model),
    messages,
    maxTokens: request.maxTokens,
    temperature: request.temperature
  });

  const metadata = (async () => {
    const usage = await result.usage;
    const endTime = Date.now();

    const inputTokens = usage?.inputTokens ?? 0;
    const outputTokens = usage?.outputTokens ?? 0;

    return {
      provider: resolved.provider,
      model,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      },
      cost: calculateCost(resolved.provider, model, inputTokens, outputTokens),
      durationMs: endTime - startTime
    };
  })();

  return {
    stream: result.textStream,
    metadata
  };
}
