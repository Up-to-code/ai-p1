import { describe, expect, it } from "vitest";
import { cn } from "./classnames";
import { createUnsafeApiProxy, createUnsafeApiRecord } from "./convex-api";
import { DomainError, normalizeDomainError } from "./errors";
import {
  deriveConvexSiteUrl,
  isLoopbackOrigin,
  normalizeBaseUrl,
  resolveAuthBridgeConfig,
} from "./auth-next";
import {
  formatLocaleNumber,
  getLocaleDateFormat,
  getLocaleDirection,
  getNextLocale,
  resolveLocale,
} from "./locale";
import { toSessionUser, type SessionContext } from "./session";

describe("@anan/platform-core auth-next", () => {
  it("uses local Convex defaults outside production", () => {
    expect(resolveAuthBridgeConfig({ NODE_ENV: "development" })).toEqual({
      convexUrl: "http://localhost:3210",
      convexSiteUrl: "http://localhost:3211",
      isConfigured: true,
    });
  });

  it("rejects loopback Convex URLs in production", () => {
    expect(resolveAuthBridgeConfig({
      NODE_ENV: "production",
      NEXT_PUBLIC_CONVEX_URL: "http://localhost:3210",
      CONVEX_SITE_URL: "http://127.0.0.1:3211",
    })).toEqual({
      convexUrl: "http://localhost:3210",
      convexSiteUrl: "http://localhost:3211",
      isConfigured: false,
    });
  });

  it("derives Convex site URLs from hosted cloud URLs", () => {
    expect(deriveConvexSiteUrl("https://happy-otter-123.convex.cloud")).toBe(
      "https://happy-otter-123.convex.site",
    );
  });

  it("normalizes URLs and detects loopback hosts", () => {
    expect(normalizeBaseUrl("anan.test/")).toBe("https://anan.test");
    expect(isLoopbackOrigin("http://localhost:3000")).toBe(true);
    expect(isLoopbackOrigin("https://anan.test")).toBe(false);
  });
});

describe("@anan/platform-core errors", () => {
  it("preserves existing DomainError instances", () => {
    const error = new DomainError({ code: "FORBIDDEN", message: "No", status: 403 });
    expect(normalizeDomainError(error)).toBe(error);
  });

  it("maps Convex JSON payloads to HTTP statuses including rate limits", () => {
    const error = new Error('ConvexError: {"code":"RATE_LIMITED","message":"Slow down"}');
    expect(normalizeDomainError(error)).toMatchObject({
      code: "RATE_LIMITED",
      message: "Slow down",
      status: 429,
    });
  });
});

describe("@anan/platform-core session", () => {
  it("projects session context to UI user shape", () => {
    const context: SessionContext = {
      userId: "user-1",
      email: "a@example.com",
      name: "A",
      isActive: true,
      organizationId: "org-1",
      organizationPermissions: ["clients:read"],
      adminAccess: { enabled: true, level: "owner", permissions: ["admin"] },
    };

    expect(toSessionUser(context)).toEqual({
      id: "user-1",
      email: "a@example.com",
      name: "A",
      image: undefined,
      username: undefined,
      organizationId: "org-1",
      organizationSlug: undefined,
      organizationRole: undefined,
      organizationPermissions: ["clients:read"],
      isActive: true,
    });
  });
});

describe("@anan/platform-core locale", () => {
  it("resolves supported locales and formatting helpers", () => {
    expect(resolveLocale("fr")).toBe("fr");
    expect(resolveLocale("es")).toBe("ar");
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDateFormat("en")).toBe("en-US");
    expect(getNextLocale("fr")).toBe("ar");
    expect(formatLocaleNumber("en", 1234)).toContain("1");
  });
});

describe("@anan/platform-core classnames and Convex API adapters", () => {
  it("merges conditional class names", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });

  it("creates unsafe Convex API records without importing generated API", () => {
    const source = { users: { current: "ref" } };
    expect(createUnsafeApiProxy(source).users).toEqual({ current: "ref" });
    expect(createUnsafeApiRecord(source)).toBe(source);
  });
});
