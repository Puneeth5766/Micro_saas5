import { logRetryAttempt } from "../logging";
import type { AIProvider } from "../types";
import { AetherAIError } from "./errors";

export type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
  provider?: AIProvider;
};

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function computeDelay(attempt: number, options: Required<RetryOptions>): number {
  const backoff = options.baseDelayMs * 2 ** attempt;
  const randomJitter = options.jitter ? Math.floor(Math.random() * 1000) : 0;
  return Math.min(backoff + randomJitter, options.maxDelayMs);
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const resolvedOptions: Required<RetryOptions> = { ...DEFAULT_OPTIONS, ...options };

  let lastError: unknown;

  for (let attempt = 0; attempt < resolvedOptions.maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const retryable = error instanceof AetherAIError && error.retryable;
      const hasAttemptsLeft = attempt < resolvedOptions.maxAttempts - 1;

      if (!retryable || !hasAttemptsLeft) {
        throw error;
      }

      const delayMs = computeDelay(attempt, resolvedOptions);
      const attemptNumber = attempt + 1;

      if (resolvedOptions.provider) {
        logRetryAttempt(attemptNumber, delayMs, resolvedOptions.provider);
      }

      await sleep(delayMs);
    }
  }

  throw lastError;
}
