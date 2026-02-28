import type { AIProvider } from "../types";
import { logCircuitBreaker } from "../logging";
import { AetherAIError } from "./errors";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

type CircuitBreakerConfig = {
  failureThreshold: number;
  resetTimeoutMs: number;
};

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60000
};

export class CircuitBreaker {
  private readonly provider: AIProvider;
  private readonly config: CircuitBreakerConfig;
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureAt = 0;

  constructor(provider: AIProvider, config: CircuitBreakerConfig = DEFAULT_CONFIG) {
    this.provider = provider;
    this.config = config;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      const elapsed = Date.now() - this.lastFailureAt;

      if (elapsed >= this.config.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        logCircuitBreaker(this.provider, this.state);
      } else {
        throw new AetherAIError({
          message: `Circuit is OPEN for provider ${this.provider}.`,
          provider: this.provider,
          statusCode: 503,
          retryable: true
        });
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
    logCircuitBreaker(this.provider, this.state);
  }

  private onFailure(): void {
    this.failureCount += 1;
    this.lastFailureAt = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = "OPEN";
      logCircuitBreaker(this.provider, this.state);
      return;
    }

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      logCircuitBreaker(this.provider, this.state);
    }
  }
}

const breakerRegistry = new Map<AIProvider, CircuitBreaker>();

export function getCircuitBreaker(provider: AIProvider): CircuitBreaker {
  const existing = breakerRegistry.get(provider);
  if (existing) {
    return existing;
  }

  const created = new CircuitBreaker(provider);
  breakerRegistry.set(provider, created);
  return created;
}
