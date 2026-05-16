import { Effect } from "effect";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { BadRequest, RateLimited } from "@qentrah/platform-core/effect-api";
import { runEffectRoute } from "./route";

describe("Workspace Effect Hono route Adapter", () => {
  it("returns successful JSON", async () => {
    const app = new Hono().get("/ok", (c) => runEffectRoute(c, Effect.succeed({ ok: true })));

    const response = await app.request("/ok");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("maps typed errors to stable JSON", async () => {
    const app = new Hono().get("/bad", (c) => runEffectRoute(c, Effect.fail(new BadRequest("No"))));

    const response = await app.request("/bad");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "BAD_REQUEST",
      error: "No",
      status: 400,
    });
  });

  it("sets Retry-After for rate limited errors", async () => {
    const app = new Hono().get("/limited", (c) => runEffectRoute(
      c,
      Effect.fail(new RateLimited("Slow down", 1500)),
    ));

    const response = await app.request("/limited");

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
  });

  it("sets rate-limit headers on success", async () => {
    const app = new Hono().get("/headers", (c) => runEffectRoute(c, Effect.succeed({ ok: true }), {
      rateLimit: {
        allowed: true,
        limit: 2,
        remaining: 1,
        resetAt: 2000,
      },
    }));

    const response = await app.request("/headers");

    expect(response.headers.get("RateLimit-Limit")).toBe("2");
    expect(response.headers.get("RateLimit-Remaining")).toBe("1");
    expect(response.headers.get("RateLimit-Reset")).toBe("2");
  });
});
