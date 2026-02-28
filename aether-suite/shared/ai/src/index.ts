import { generateAI } from "./core/generate";
import { PromptTemplate, buildSystemPrompt } from "./core/prompt";
import { streamAI } from "./core/stream";
import {
  logAIError,
  logAIRequest,
  logAIResponse,
  logMeteringError
} from "./logging";
import { getRateLimiter } from "./metering/rate-limiter";
import { trackUsage } from "./metering/token-tracker";
import { getUsageStats } from "./metering/usage-stats";
import { getProvider } from "./providers";
import { getCircuitBreaker } from "./resilience/circuit-breaker";
import { AetherAIError, mapProviderError } from "./resilience/errors";
import { withRetry } from "./resilience/retry";
import type { AetherAIRequest, AetherAIResponse } from "./types";

export { generateAI, streamAI };
export { PromptTemplate, buildSystemPrompt };
export { withRetry, AetherAIError, mapProviderError };
export { getRateLimiter, trackUsage, getUsageStats };
export type { AIProvider, AetherAIRequest, AetherAIResponse, AetherStreamResponse } from "./types";

export async function executeAI(request: AetherAIRequest): Promise<AetherAIResponse> {
  logAIRequest(request);

  try {
    const rateLimiter = getRateLimiter();
    await rateLimiter.hydrateUserTier(request.userId);

    const rateResult = rateLimiter.check(request.userId, request.productId);
    if (!rateResult.allowed) {
      throw new AetherAIError({
        message: "Rate limit exceeded.",
        provider: request.provider ?? getProvider().provider,
        model: request.model,
        statusCode: 429,
        retryable: true,
        originalError: { retryAfterMs: rateResult.retryAfterMs }
      });
    }

    const resolvedProvider = getProvider(request.provider).provider;
    const circuitBreaker = getCircuitBreaker(resolvedProvider);

    const result = await circuitBreaker.execute(() =>
      withRetry(() => generateAI(request), { provider: resolvedProvider })
    );

    logAIResponse(result, result.durationMs);

    void trackUsage({
      userId: request.userId,
      productId: request.productId,
      action: request.action,
      provider: result.provider,
      model: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      cost: result.cost
    }).catch((error: unknown) => {
      logMeteringError(error, result.provider, result.model);
    });

    return result;
  } catch (error) {
    const mapped = mapProviderError(request.provider ?? getProvider().provider, error, request.model);
    logAIError(mapped, request);
    throw mapped;
  }
}

export * from "./logging";
