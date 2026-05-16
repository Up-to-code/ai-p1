import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  BadRequest,
  Forbidden,
  apiErrorPayload,
  appendRateLimitHeaders,
  buildCacheKey,
  checkInMemoryRateLimit,
  createInMemoryRateLimitService,
  createMemoryCacheService,
  limitEffect,
  normalizeApiError,
  rateLimitKey,
} from "./effect-api";

describe("@qentrah/platform-core effect-api errors", () => {
  it("maps typed errors to stable payloads", () => {
    const error = new BadRequest("Nope", { name: ["Required"] });

    expect(apiErrorPayload(error)).toEqual({
      error: "Nope",
      code: "BAD_REQUEST",
      status: 400,
      issues: { name: ["Required"] },
    });
  });

  it("normalizes existing status-bearing errors", () => {
    const error = Object.assign(new Error("Denied"), { status: 403, code: "DENIED" });

    expect(normalizeApiError(error)).toMatchObject({
      code: "DENIED",
      message: "Denied",
      status: 403,
    });
  });
});

describe("@qentrah/platform-core effect-api cache", () => {
  it("builds stable scoped keys", () => {
    expect(buildCacheKey({
      scope: "per-organization",
      namespace: "partners.catalog",
      parts: [" org_1 ", "active"],
    })).toBe("per-organization:partners.catalog:org_1:active");
  });

  it("deduplicates getOrCompute and supports invalidation", async () => {
    const cache = createMemoryCacheService();
    let calls = 0;
    const key = { scope: "global" as const, namespace: "catalog", parts: ["published"] };
    const policy = { ttlMs: 1000, capacity: 10 };

    const first = await Effect.runPromise(cache.getOrCompute(key, policy, () => Effect.sync(() => {
      calls += 1;
      return `value-${calls}`;
    })));
    const second = await Effect.runPromise(cache.getOrCompute(key, policy, () => Effect.sync(() => {
      calls += 1;
      return `value-${calls}`;
    })));

    await Effect.runPromise(cache.invalidate(key));
    const third = await Effect.runPromise(cache.getOrCompute(key, policy, () => Effect.sync(() => {
      calls += 1;
      return `value-${calls}`;
    })));

    expect([first, second, third]).toEqual(["value-1", "value-1", "value-2"]);
  });

  it("rejects sensitive global cache keys", async () => {
    const cache = createMemoryCacheService();

    const result = await Effect.runPromise(Effect.either(cache.getOrCompute(
      { scope: "global", namespace: "clients", parts: ["all"] },
      { ttlMs: 1000, sensitive: true },
      () => Effect.succeed([]),
    )));

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(Forbidden);
    }
  });
});

describe("@qentrah/platform-core effect-api rate-limit", () => {
  it("checks in-memory buckets and reset windows", () => {
    const buckets = new Map();
    const policy = { limit: 2, windowMs: 1000 };

    expect(checkInMemoryRateLimit(buckets, "k", policy, 0)).toMatchObject({ allowed: true, remaining: 1 });
    expect(checkInMemoryRateLimit(buckets, "k", policy, 10)).toMatchObject({ allowed: true, remaining: 0 });
    expect(checkInMemoryRateLimit(buckets, "k", policy, 20)).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterMs: 980,
    });
    expect(checkInMemoryRateLimit(buckets, "k", policy, 1001)).toMatchObject({ allowed: true, remaining: 1 });
  });

  it("provides service and header helpers", async () => {
    const service = createInMemoryRateLimitService();
    const result = await Effect.runPromise(service.check(rateLimitKey("SignIn", " A@EXAMPLE.COM "), {
      limit: 1,
      windowMs: 1000,
    }));
    const headers = new Headers();

    appendRateLimitHeaders(headers, result);

    expect(result.allowed).toBe(true);
    expect(headers.get("RateLimit-Limit")).toBe("1");
    expect(headers.get("RateLimit-Remaining")).toBe("0");
  });

  it("can wrap internal effects with Effect RateLimiter", async () => {
    await expect(Effect.runPromise(limitEffect(Effect.succeed("ok"), {
      limit: 1,
      windowMs: 1,
    }))).resolves.toBe("ok");
  });
});
