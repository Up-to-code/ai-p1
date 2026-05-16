import { Duration, Effect, RateLimiter } from "effect";
import { BadRequest } from "./effect-api-errors";

export interface RateLimitPolicy {
  readonly limit: number;
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number;
  readonly retryAfterMs?: number;
}

export interface RateLimitService {
  check(key: string, policy: RateLimitPolicy): Effect.Effect<RateLimitResult>;
}

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export function rateLimitKey(...parts: Array<string | number | undefined | null>) {
  return parts
    .filter((part) => part !== undefined && part !== null && String(part).trim())
    .map((part) => String(part).trim().toLowerCase())
    .join(":");
}

export function checkInMemoryRateLimit(
  buckets: Map<string, RateLimitBucket>,
  key: string,
  policy: RateLimitPolicy,
  now = Date.now(),
): RateLimitResult {
  if (policy.limit <= 0) throw new BadRequest("Rate limit must be greater than zero.");
  if (policy.windowMs <= 0) throw new BadRequest("Rate limit window must be greater than zero.");

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + policy.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, limit: policy.limit, remaining: policy.limit - 1, resetAt };
  }

  if (existing.count >= policy.limit) {
    return {
      allowed: false,
      limit: policy.limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    allowed: true,
    limit: policy.limit,
    remaining: policy.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export function createInMemoryRateLimitService(
  buckets: Map<string, RateLimitBucket> = new Map(),
): RateLimitService {
  return {
    check: (key, policy) => Effect.sync(() => checkInMemoryRateLimit(buckets, key, policy)),
  };
}

export function rateLimitHeaderRecord(result: RateLimitResult): Record<string, string> {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfterMs === undefined
      ? {}
      : { "Retry-After": String(Math.max(1, Math.ceil(result.retryAfterMs / 1000))) }),
  };
}

export function appendRateLimitHeaders(headers: Headers, result: RateLimitResult) {
  for (const [key, value] of Object.entries(rateLimitHeaderRecord(result))) {
    headers.set(key, value);
  }
}

export function limitEffect<A, E, R>(
  program: Effect.Effect<A, E, R>,
  policy: RateLimitPolicy,
  algorithm: "fixed-window" | "token-bucket" = "token-bucket",
) {
  return Effect.scoped(
    Effect.gen(function* () {
      const limiter = yield* RateLimiter.make({
        limit: policy.limit,
        interval: Duration.millis(policy.windowMs),
        algorithm,
      });
      return yield* limiter(program);
    }),
  );
}
