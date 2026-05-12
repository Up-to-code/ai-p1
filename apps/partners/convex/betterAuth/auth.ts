import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions, type BetterAuthPlugin } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

const LOCAL_PARTNER_SIGNUP_BRIDGE_SECRET = "local-anan-partner-signup-bridge-secret";
const LOCAL_BETTER_AUTH_SECRET = "local-anan-partners-better-auth-secret";

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function readCsvEnv(name: string) {
  return (readOptionalEnv(name) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeBaseUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/+$/u, "");
  if (!trimmed) return undefined;
  if (!/^https?:\/\//iu.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function isLoopbackOrigin(value?: string | null) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return false;

  try {
    const url = new URL(normalized);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function isProductionLikeEnv() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function isHostedProductionEnv() {
  return process.env.VERCEL_ENV === "production";
}

function isLocalDevelopmentEnv() {
  const hasLoopbackOrigin = [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_PARTNERS_AUTH_URL,
    process.env.BETTER_AUTH_URL,
  ].some((value) => isLoopbackOrigin(value));

  return process.env.VERCEL_ENV !== "production" && (process.env.NODE_ENV === "development" || hasLoopbackOrigin);
}

function getAuthBaseUrl() {
  const isHostedProduction = isHostedProductionEnv();
  const candidates = [
    process.env.NEXT_PUBLIC_PARTNERS_AUTH_URL,
    process.env.BETTER_AUTH_URL,
    process.env.SITE_URL,
    process.env.VERCEL_URL,
    "http://localhost:3002",
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (!normalized) continue;
    if (isHostedProduction && isLoopbackOrigin(normalized)) continue;
    return normalized;
  }

  return undefined;
}

function getTrustedOrigins() {
  return [
    getAuthBaseUrl(),
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    process.env.CONVEX_SITE_URL,
    ...readCsvEnv("BETTER_AUTH_TRUSTED_ORIGINS"),
    ...readCsvEnv("PARTNERS_AUTH_ALLOWED_ORIGINS"),
  ].filter((origin): origin is string => Boolean(normalizeBaseUrl(origin)));
}

function getPartnerSignupBridgeSecret() {
  return readOptionalEnv("PARTNER_SIGNUP_BRIDGE_SECRET")
    ?? (isLocalDevelopmentEnv() ? LOCAL_PARTNER_SIGNUP_BRIDGE_SECRET : undefined);
}

function getBetterAuthSecret() {
  return readOptionalEnv("BETTER_AUTH_SECRET")
    ?? (isProductionLikeEnv() ? undefined : LOCAL_BETTER_AUTH_SECRET);
}

function passwordSignupGatePlugin(): BetterAuthPlugin {
  return {
    id: "partners-password-signup-gate",
    hooks: {
      before: [
        {
          matcher: (context) => context.path === "/sign-up/email",
          handler: createAuthMiddleware(async (ctx) => {
            const expected = getPartnerSignupBridgeSecret();
            const provided = ctx.headers?.get("x-anan-partner-signup-secret");

            if (expected && provided === expected) {
              return;
            }

            throw new APIError("FORBIDDEN", {
              message: "Partner password signup requires the trusted signup flow.",
            });
          }),
        },
      ],
    },
  };
}

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    appName: "Anan Partners",
    baseURL: getAuthBaseUrl(),
    secret: getBetterAuthSecret(),
    trustedOrigins: getTrustedOrigins(),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    plugins: [
      passwordSignupGatePlugin(),
      convex({ authConfig }),
    ],
  }) satisfies BetterAuthOptions;

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));
