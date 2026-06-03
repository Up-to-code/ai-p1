import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

async function loadAuthConfig(env: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV, ...env };
  return import("./auth");
}

afterEach(() => {
  process.env = ORIGINAL_ENV;
  vi.resetModules();
});

describe("auth runtime config", () => {
  it("uses the public site URL when explicit auth URLs are absent", async () => {
    const { getAuthRuntimeConfig } = await loadAuthConfig({
      WORKOS_COOKIE_PASSWORD: "x".repeat(32),
      NEXT_PUBLIC_SITE_URL: "https://w-ai.online",
      SITE_URL: "",
      VERCEL_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "",
    });

    const config = getAuthRuntimeConfig("runtime");

    expect(config.siteUrl).toBe("https://w-ai.online");
    expect(config.trustedOrigins).toContain("https://w-ai.online");
  });

  it("adds configured trusted origins with URL normalization", async () => {
    const { getAuthRuntimeConfig } = await loadAuthConfig({
      WORKOS_COOKIE_PASSWORD: "x".repeat(32),
      SITE_URL: "http://localhost:3000",
      TRUSTED_ORIGINS: "w-ai.online, https://admin.w-ai.online, qentrah://auth-callback, partners.w-ai.online",
    });

    expect(getAuthRuntimeConfig("runtime").trustedOrigins).toEqual(
      expect.arrayContaining([
        "https://w-ai.online",
        "https://admin.w-ai.online",
        "qentrah://auth-callback",
        "https://partners.w-ai.online",
      ]),
    );
  });

  it("trusts the production Workspace and Admin origins by default", async () => {
    const { getAuthRuntimeConfig } = await loadAuthConfig({
      WORKOS_COOKIE_PASSWORD: "x".repeat(32),
      VERCEL_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "",
      NEXT_PUBLIC_SITE_URL: "",
      SITE_URL: "",
      ADMIN_SITE_URL: "",
      TRUSTED_ORIGINS: "",
    });

    const config = getAuthRuntimeConfig("runtime");

    expect(config.siteUrl).toBe("https://app.qentrah.com");
    expect(config.trustedOrigins).toEqual(expect.arrayContaining([
      "https://app.qentrah.com",
      "https://admin.qentrah.com",
      "http://localhost:3000",
      "http://localhost:3003",
      "qentrah://",
      "qentrah://auth-callback",
      "qentrah:///auth-callback",
    ]));
  });
});
