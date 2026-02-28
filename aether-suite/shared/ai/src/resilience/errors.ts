import type { AIProvider } from "../types";

export class AetherAIError extends Error {
  provider: AIProvider;
  model?: string;
  statusCode: number;
  retryable: boolean;
  originalError?: unknown;

  constructor(params: {
    message: string;
    provider: AIProvider;
    model?: string;
    statusCode?: number;
    retryable?: boolean;
    originalError?: unknown;
  }) {
    super(params.message);
    this.name = "AetherAIError";
    this.provider = params.provider;
    this.model = params.model;
    this.statusCode = params.statusCode ?? 500;
    this.retryable = params.retryable ?? false;
    this.originalError = params.originalError;
  }
}

function extractMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown provider error.";
}

function extractStatusCode(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null) {
    const candidate = (error as { statusCode?: unknown; status?: unknown }).statusCode ??
      (error as { status?: unknown }).status;

    if (typeof candidate === "number") {
      return candidate;
    }
  }

  return undefined;
}

export function mapProviderError(provider: AIProvider, error: unknown, model?: string): AetherAIError {
  if (error instanceof AetherAIError) {
    return error;
  }

  const statusCode = extractStatusCode(error);
  const message = extractMessage(error);
  const lowerMessage = message.toLowerCase();

  if (statusCode === 429 || lowerMessage.includes("rate limit")) {
    return new AetherAIError({
      message,
      provider,
      model,
      statusCode: 429,
      retryable: true,
      originalError: error
    });
  }

  if (statusCode === 401 || lowerMessage.includes("unauthorized") || lowerMessage.includes("invalid api key")) {
    return new AetherAIError({
      message,
      provider,
      model,
      statusCode: 401,
      retryable: false,
      originalError: error
    });
  }

  if (statusCode === 400 && (lowerMessage.includes("context length") || lowerMessage.includes("maximum context"))) {
    return new AetherAIError({
      message,
      provider,
      model,
      statusCode: 400,
      retryable: false,
      originalError: error
    });
  }

  if (statusCode === 500 || statusCode === 503) {
    return new AetherAIError({
      message,
      provider,
      model,
      statusCode,
      retryable: true,
      originalError: error
    });
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return new AetherAIError({
      message,
      provider,
      model,
      statusCode: statusCode ?? 504,
      retryable: true,
      originalError: error
    });
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("econnreset") || lowerMessage.includes("fetch failed")) {
    return new AetherAIError({
      message,
      provider,
      model,
      statusCode: statusCode ?? 503,
      retryable: true,
      originalError: error
    });
  }

  return new AetherAIError({
    message,
    provider,
    model,
    statusCode: statusCode ?? 500,
    retryable: false,
    originalError: error
  });
}
