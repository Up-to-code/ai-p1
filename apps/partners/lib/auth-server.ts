import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export type PartnersAuthBridgeConfig = {
  convexUrl: string;
  convexSiteUrl: string;
  isConfigured: boolean;
};

function normalizeBaseUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/+$/u, "");
  if (!trimmed) return null;
  if (!/^https?:\/\//iu.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function deriveConvexSiteUrl(convexUrl: string | null) {
  if (!convexUrl) return null;

  try {
    const parsed = new URL(convexUrl);
    if (!parsed.hostname.endsWith(".convex.cloud")) return null;
    parsed.hostname = parsed.hostname.replace(/\.convex\.cloud$/u, ".convex.site");
    return parsed.toString().replace(/\/$/u, "");
  } catch {
    return null;
  }
}

export function resolveAuthBridgeConfig(env: Record<string, string | undefined> = process.env): PartnersAuthBridgeConfig {
  const convexUrl = normalizeBaseUrl(env.CONVEX_URL) ?? normalizeBaseUrl(env.NEXT_PUBLIC_CONVEX_URL);
  const convexSiteUrl =
    normalizeBaseUrl(env.CONVEX_SITE_URL)
    ?? normalizeBaseUrl(env.NEXT_PUBLIC_CONVEX_SITE_URL)
    ?? deriveConvexSiteUrl(convexUrl);

  if (!convexUrl || !convexSiteUrl) {
    return {
      convexUrl: "http://localhost:3210",
      convexSiteUrl: "http://localhost:3211",
      isConfigured: false,
    };
  }

  return {
    convexUrl,
    convexSiteUrl,
    isConfigured: true,
  };
}

function createAuthConfigurationError() {
  const error = new Error(
    "Partners auth is missing Convex auth URLs. Set NEXT_PUBLIC_CONVEX_URL and NEXT_PUBLIC_CONVEX_SITE_URL or CONVEX_URL and CONVEX_SITE_URL.",
  ) as Error & { status?: number; code?: string };
  error.code = "AUTH_CONFIGURATION_ERROR";
  error.status = 503;
  return error;
}

const config = resolveAuthBridgeConfig();
const bridge = convexBetterAuthNextJs({
  convexUrl: config.convexUrl,
  convexSiteUrl: config.convexSiteUrl,
});

function ensureAuthBridgeConfigured() {
  if (!config.isConfigured) {
    throw createAuthConfigurationError();
  }
}

export const handler = {
  GET: (...args: Parameters<typeof bridge.handler.GET>) => {
    ensureAuthBridgeConfigured();
    return bridge.handler.GET(...args);
  },
  POST: (...args: Parameters<typeof bridge.handler.POST>) => {
    ensureAuthBridgeConfigured();
    return bridge.handler.POST(...args);
  },
};

export async function getToken(...args: Parameters<typeof bridge.getToken>) {
  ensureAuthBridgeConfigured();
  return await bridge.getToken(...args);
}
