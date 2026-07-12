import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };
type LimitResult = { allowed: boolean; retryAfterSeconds: number };

const localBuckets = new Map<string, Bucket>();
const distributedLimiter = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(30, "60 s"),
      prefix: "qentrah:mcp:preauth",
      analytics: true,
    })
  : null;

export function hasDistributedPreAuthLimit() {
  return distributedLimiter !== null;
}

function developmentLimit(key: string, now = Date.now()): LimitResult {
  const windowMs = 60_000;
  const max = 30;
  const existing = localBuckets.get(key);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : existing;
  bucket.count += 1;
  localBuckets.set(key, bucket);
  return {
    allowed: bucket.count <= max,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Distributed when configured; per-instance fallback keeps OAuth usable during Redis outages. */
export async function preAuthLimit(key: string): Promise<LimitResult> {
  if (distributedLimiter) {
    const result = await distributedLimiter.limit(key);
    return {
      allowed: result.success,
      retryAfterSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  }
  return developmentLimit(key);
}
