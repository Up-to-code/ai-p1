export type RetryPolicy = {
  maxAttempts: number;
  initialBackoffMs: number;
  base: number;
  maxBackoffMs: number;
  jitter: number;
};

export const HTTP_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialBackoffMs: 250,
  base: 2,
  maxBackoffMs: 4000,
  jitter: 0.2,
};

export const WORKFLOW_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  initialBackoffMs: 250,
  base: 2,
  maxBackoffMs: 4000,
  jitter: 0.2,
};

export function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(429|503|timeout|ECONNRESET|EAI_AGAIN|rate limit)\b/i.test(message);
}

export function getBackoffWithJitter(attempt: number, policy: RetryPolicy): number {
  const raw = policy.initialBackoffMs * Math.pow(policy.base, attempt);
  const capped = Math.min(raw, policy.maxBackoffMs);
  const jitterWindow = capped * policy.jitter;
  const jittered = capped + (Math.random() * jitterWindow * 2 - jitterWindow);
  return Math.max(0, Math.round(jittered));
}

function shouldRetryAttempt(error: unknown, attempt: number, policy: RetryPolicy): boolean {
  const hasMoreAttempts = attempt + 1 < policy.maxAttempts;
  return hasMoreAttempts && isRetryableError(error);
}

function getRetryDelayOrThrow(error: unknown, attempt: number, policy: RetryPolicy) {
  if (!shouldRetryAttempt(error, attempt, policy)) throw error;
  return getBackoffWithJitter(attempt, policy);
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  policy: RetryPolicy = HTTP_RETRY_POLICY,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < policy.maxAttempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const delay = getRetryDelayOrThrow(error, attempt, policy);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Retry attempts exhausted");
}
