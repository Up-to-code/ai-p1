import { brandEnvName, brandLabel, brandProductName, brandRoutePath, readBrandEnv } from "@qentrah/brand-identity";

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
    workspaceBaseUrl: normalizeBaseUrl(requiredBrandEnv("WORKSPACE_API_URL", env)),
    clientId: requiredBrandEnv("CLIENT_ID", env),
    clientSecret: optionalBrandEnv("CLIENT_SECRET", env),
    partnerAppUrl: normalizeBaseUrl(requiredEnv("PARTNER_APP_URL", env)),
    demoAccessToken: requiredEnv("DEMO_ACCESS_TOKEN", env),
    sessionSecret,
  };
}

export function publicDemoConfig(env: Record<string, string | undefined> = process.env) {
  return {
    workspaceBaseUrl: normalizeBaseUrl(readBrandEnv("WORKSPACE_API_URL", env, "http://localhost:3000") ?? "http://localhost:3000"),
    partnerAppUrl: normalizeBaseUrl(env.PARTNER_APP_URL ?? "http://localhost:3004"),
  };
}

export function requiredBrandEnv(key: string, env: Record<string, string | undefined> = process.env) {
  const value = readBrandEnv(key, env);
  if (!value) throw new Error(`Set ${brandEnvName(key)} before running the demo app.`);
  return value;
}

export function optionalBrandEnv(key: string, env: Record<string, string | undefined> = process.env) {
  return readBrandEnv(key, env);
}

export const demoBrandConfig = {
  brandName: brandLabel("en"),
  appName: brandProductName("demo", "en"),
  oauthStartPath: brandRoutePath("oauthStart"),
  oauthCallbackPath: brandRoutePath("oauthCallback"),
  oauthLogoutPath: brandRoutePath("oauthLogout"),
};
