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
      BETTER_AUTH_TRUSTED_ORIGINS: "w-ai.online, https://admin.w-ai.online ",
      TRUSTED_ORIGINS: "partners.w-ai.online",
    });

    expect(getAuthRuntimeConfig("runtime").trustedOrigins).toEqual(
      expect.arrayContaining([
        "https://w-ai.online",
        "https://admin.w-ai.online",
        "https://partners.w-ai.online",
      ]),
    );
  });
});
