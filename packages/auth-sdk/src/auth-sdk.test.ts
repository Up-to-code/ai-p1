import { describe, expect, it, vi } from "vitest";
import { createCsrfTokenPair } from "./client/csrf";
import { createMemoryTokenStore } from "./client/token-store";
import { createRefreshScheduler } from "./client/refresh-scheduler";
import { requireEntitlement, requireScopes } from "./authorization";
import { createMockAuthContext } from "./testing";
import { assertCsrfRequest } from "./server/csrf";
import { serializeSecureCookie } from "./server/cookies";
import { requireAuthContext, sanitizeAuthContext } from "./server/session";

describe("@anan/auth-sdk", () => {
  it("keeps access tokens in memory without touching browser storage", () => {
    const store = createMemoryTokenStore();
    store.set({
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresAtMs: Date.now() + 60_000,
      scopes: ["openid"],
    });

    expect(store.get()?.accessToken).toBe("access-token");
    expect(Object.keys(store.get() ?? {})).not.toContain("refreshToken");
  });

  it("creates CSRF token pairs and validates double-submit requests", () => {
    const pair = createCsrfTokenPair();
    const request = new Request("https://example.com/api/auth-sdk/refresh", {
      method: "POST",
      headers: {
        cookie: `__Host-anan_csrf=${pair.cookieToken}`,
        "x-anan-csrf": pair.headerToken,
      },
    });

    expect(() => assertCsrfRequest(request)).not.toThrow();
    expect(() => assertCsrfRequest(new Request("https://example.com"))).toThrow(/CSRF/i);
  });

  it("serializes secure cookies with production defaults", () => {
    expect(serializeSecureCookie({ name: "__Host-test", value: "abc", maxAgeSeconds: 60 }))
      .toBe("__Host-test=abc; Path=/; SameSite=Lax; Max-Age=60; HttpOnly; Secure");
  });

  it("schedules refresh before token expiry", () => {
    vi.useFakeTimers();
    const refresh = vi.fn(async () => undefined);
    const scheduler = createRefreshScheduler({ refresh, skewMs: 1_000, minimumDelayMs: 100 });
    scheduler.schedule(Date.now() + 2_000);
    vi.advanceTimersByTime(3_000);
    expect(refresh).toHaveBeenCalledTimes(1);
    scheduler.stop();
    vi.useRealTimers();
  });

  it("enforces scopes and entitlements from shared auth contexts", () => {
    const context = createMockAuthContext({
      scopes: ["clients:read"],
      entitlements: ["workspace:developer"],
    });

    expect(requireScopes(context, ["clients:read"])).toBe(context);
    expect(requireEntitlement(context, "workspace:developer")).toBe(context);
    expect(() => requireScopes(context, ["clients:create"])).toThrow(/scope/i);
  });

  it("sanitizes server auth context before sending it to React", () => {
    const session = requireAuthContext({
      token: "secret-token",
      session: {
        userId: "u1",
        role: "developer",
        redId: "red1",
        isActive: true,
      },
    });

    const safe = sanitizeAuthContext(session.context);
    expect("token" in safe).toBe(false);
    expect(safe.entitlements).toContain("workspace:developer");
  });
});
