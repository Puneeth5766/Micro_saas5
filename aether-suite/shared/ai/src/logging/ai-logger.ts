import { createHash } from "node:crypto";
import type { AetherAIRequest, AetherAIResponse, AIProvider } from "../types";
import type { AetherAIError } from "../resilience";
import { logger } from "./logger";

function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 8);
}

export function logAIRequest(request: AetherAIRequest): void {
  logger.info("ai.request", {
    provider: request.provider ?? "default",
    model: request.model ?? "default",
    productId: request.productId,
    userIdHash: hashUserId(request.userId),
    action: request.action,
    timestamp: new Date().toISOString()
  });
}

export function logAIResponse(response: AetherAIResponse, durationMs: number): void {
  logger.info("ai.response", {
    provider: response.provider,
    model: response.model,
    inputTokens: response.usage.inputTokens,
    outputTokens: response.usage.outputTokens,
    cost: response.cost,
    durationMs
  });
}

export function logAIError(error: AetherAIError, request: AetherAIRequest): void {
  logger.error("ai.error", {
    provider: error.provider,
    model: error.model ?? request.model ?? "default",
    statusCode: error.statusCode,
    retryable: error.retryable,
    errorMessage: error.message,
    productId: request.productId,
    userIdHash: hashUserId(request.userId),
    action: request.action
  });
}

export function logRetryAttempt(attempt: number, delayMs: number, provider: AIProvider): void {
  logger.warn("ai.retry_attempt", {
    attempt,
    delayMs,
    provider
  });
}

export function logCircuitBreaker(provider: AIProvider, state: string): void {
  logger.warn("ai.circuit_breaker", {
    provider,
    state
  });
}

export function logMeteringError(error: unknown, provider: AIProvider, model: string): void {
  logger.error("ai.metering_error", {
    provider,
    model,
    errorMessage: error instanceof Error ? error.message : String(error)
  });
}
