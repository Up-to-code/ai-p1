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
      BETTER_AUTH_SECRET: "x".repeat(32),
      NEXT_PUBLIC_SITE_URL: "https://w-ai.online",
      SITE_URL: "",
      BETTER_AUTH_URL: "",
      VERCEL_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "",
    });

    const config = getAuthRuntimeConfig("runtime");

    expect(config.siteUrl).toBe("https://w-ai.online");
    expect(config.trustedOrigins).toContain("https://w-ai.online");
  });

  it("adds configured trusted origins with URL normalization", async () => {
    const { getAuthRuntimeConfig } = await loadAuthConfig({
      BETTER_AUTH_SECRET: "x".repeat(32),
      SITE_URL: "http://localhost:3000",
      BETTER_AUTH_TRUSTED_ORIGINS: "w-ai.online, https://admin.w-ai.online, qentrah://auth-callback ",
      TRUSTED_ORIGINS: "partners.w-ai.online",
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
      BETTER_AUTH_SECRET: "x".repeat(32),
      VERCEL_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "",
      NEXT_PUBLIC_SITE_URL: "",
      SITE_URL: "",
      BETTER_AUTH_URL: "",
      ADMIN_SITE_URL: "",
      BETTER_AUTH_TRUSTED_ORIGINS: "",
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

  it("falls back to a local secret when BETTER_AUTH_SECRET is missing outside production", async () => {
    const { getAuthRuntimeConfig } = await loadAuthConfig({
      BETTER_AUTH_SECRET: "",
      NODE_ENV: "development",
      BETTER_AUTH_URL: "http://localhost:3000",
    });

    expect(getAuthRuntimeConfig("runtime").secret).toBe("local-qentrah-workspace-better-auth-secret");
  });

  it("falls back to a local secret when Convex local dev reports NODE_ENV as production", async () => {
    const { getAuthRuntimeConfig } = await loadAuthConfig({
      BETTER_AUTH_SECRET: "",
      NODE_ENV: "production",
      CONVEX_DEPLOYMENT: "anonymous:anonymous-workspace",
      BETTER_AUTH_URL: "http://localhost:3000",
    });

    expect(getAuthRuntimeConfig("runtime").secret).toBe("local-qentrah-workspace-better-auth-secret");
  });

  it("still requires BETTER_AUTH_SECRET in production-like environments", async () => {
    await expect(async () => {
      const { getAuthRuntimeConfig } = await loadAuthConfig({
        BETTER_AUTH_SECRET: "",
        VERCEL_ENV: "production",
        BETTER_AUTH_URL: "http://localhost:3000",
      });

      getAuthRuntimeConfig("runtime");
    }).rejects.toThrow("BETTER_AUTH_SECRET must be at least 32 characters.");
  });

  it("still requires BETTER_AUTH_SECRET in production Convex deployments", async () => {
    await expect(async () => {
      const { getAuthRuntimeConfig } = await loadAuthConfig({
        BETTER_AUTH_SECRET: "",
        CONVEX_DEPLOYMENT: "prod:workspace",
        BETTER_AUTH_URL: "https://app.qentrah.com",
      });

      getAuthRuntimeConfig("runtime");
    }).rejects.toThrow("BETTER_AUTH_SECRET must be at least 32 characters.");
  });
});
