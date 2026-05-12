import { readAuthEnv, type AuthRuntimeEnv } from "./env";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/u, "");
}

export function normalizeIssuer(value: string): string {
  const trimmed = trimTrailingSlash(value.trim());
  if (!trimmed) {
    throw new Error("Issuer is required");
  }
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function resolveAuthIssuer(env: AuthRuntimeEnv = process.env): string {
  return normalizeIssuer(
    readAuthEnv("ANAN_AUTH_ISSUER", env)
      ?? readAuthEnv("ANAN_OAUTH_ISSUER", env)
      ?? readAuthEnv("BETTER_AUTH_URL", env)
      ?? readAuthEnv("CONVEX_SITE_URL", env)
      ?? "http://localhost:3211",
  );
}

export function getOpenIdConfigurationUrl(issuer: string): string {
  return `${normalizeIssuer(issuer)}/.well-known/openid-configuration`;
}

export function getJwksUrl(issuer: string): string {
  return `${normalizeIssuer(issuer)}/jwks`;
}
