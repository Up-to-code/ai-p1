import { describe, expect, it } from "vitest";
import { nextRateLimitBucket } from "./rateLimits";

describe("distributed MCP grant limits", () => {
  it("rejects requests after a bucket reaches its maximum", () => {
    const first = nextRateLimitBucket(null, { max: 2, windowMs: 60_000, now: 1_000 });
    const second = nextRateLimitBucket(first, { max: 2, windowMs: 60_000, now: 1_001 });
    const third = nextRateLimitBucket(second, { max: 2, windowMs: 60_000, now: 1_002 });
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets an expired bucket", () => {
    const next = nextRateLimitBucket({ count: 100, expiresAt: 999 }, { max: 2, windowMs: 60_000, now: 1_000 });
    expect(next).toMatchObject({ allowed: true, count: 1, reset: true });
  });
});
