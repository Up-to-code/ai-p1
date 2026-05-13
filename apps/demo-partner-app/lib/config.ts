import { localDemoRegistration } from "./local-demo-registration";

export const requestedScopes = localDemoRegistration.scopes;

export function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/u, "");
  if (!trimmed) throw new Error("Base URL is required.");
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function requiredEnv(name: string, env: Record<string, string | undefined> = process.env) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Set ${name} before running the demo app.`);
  return value;
}

export function optionalEnv(name: string, env: Record<string, string | undefined> = process.env) {
  return env[name]?.trim() || undefined;
}

export function demoConfig(env: Record<string, string | undefined> = process.env) {
  const sessionSecret = requiredEnv("SESSION_SECRET", env);
  if (sessionSecret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");

  return {
    workspaceBaseUrl: normalizeBaseUrl(requiredEnv("ANAN_WORKSPACE_API_URL", env)),
    clientId: requiredEnv("ANAN_CLIENT_ID", env),
    clientSecret: optionalEnv("ANAN_CLIENT_SECRET", env),
    partnerAppUrl: normalizeBaseUrl(requiredEnv("PARTNER_APP_URL", env)),
    demoAccessToken: requiredEnv("DEMO_ACCESS_TOKEN", env),
    sessionSecret,
  };
}

export function publicDemoConfig(env: Record<string, string | undefined> = process.env) {
  return {
    workspaceBaseUrl: normalizeBaseUrl(env.ANAN_WORKSPACE_API_URL ?? "http://localhost:3000"),
    partnerAppUrl: normalizeBaseUrl(env.PARTNER_APP_URL ?? "http://localhost:3004"),
  };
}
