import { headers } from "next/headers";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth, type BetterAuthOptions, type BetterAuthPlugin } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prisma } from "@/lib/prisma";

const LOCAL_PARTNER_SIGNUP_BRIDGE_SECRET = "local-qentrah-partner-signup-bridge-secret";
const LOCAL_BETTER_AUTH_SECRET = "local-qentrah-partners-better-auth-secret";

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
  const localOrigins = isHostedProductionEnv()
    ? []
    : [
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        process.env.PARTNERS_PORT ? `http://localhost:${process.env.PARTNERS_PORT}` : undefined,
        process.env.PORT ? `http://localhost:${process.env.PORT}` : undefined,
      ];

  return [...new Set([
    getAuthBaseUrl(),
    ...localOrigins,
    ...readCsvEnv("BETTER_AUTH_TRUSTED_ORIGINS"),
    ...readCsvEnv("PARTNERS_AUTH_ALLOWED_ORIGINS"),
  ]
    .map((origin) => normalizeBaseUrl(origin))
    .filter((origin): origin is string => Boolean(origin)))];
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
            const provided = ctx.headers?.get("x-qentrah-partner-signup-secret");

            if (expected && provided === expected) return;

            throw new APIError("FORBIDDEN", {
              message: "Partner password signup requires the trusted signup flow.",
            });
          }),
        },
      ],
    },
  };
}

export const authOptions = {
  appName: "Qentrah Partners",
  baseURL: getAuthBaseUrl(),
  secret: getBetterAuthSecret(),
  trustedOrigins: getTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  plugins: [passwordSignupGatePlugin()],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);

export const handler = {
  GET: (request: Request) => auth.handler(request),
  POST: (request: Request) => auth.handler(request),
};

export async function getCurrentPartnerSession(requestHeaders?: Headers) {
  return auth.api.getSession({
    headers: requestHeaders ?? await headers(),
  });
}

export async function getPartnerSessionFromRequest(request: Request) {
  return getCurrentPartnerSession(request.headers);
}

export async function requireCurrentPartnerSession(requestHeaders?: Headers) {
  const session = await getCurrentPartnerSession(requestHeaders);
  if (!session?.user?.id) throw new Error("Authentication required");
  return session;
}

export async function requireCurrentPartnerSubject(requestHeaders?: Headers) {
  const session = await requireCurrentPartnerSession(requestHeaders);
  return session.user.id;
}

export async function getToken() {
  return (await getCurrentPartnerSession())?.user?.id ?? null;
}
