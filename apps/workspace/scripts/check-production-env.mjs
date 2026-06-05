import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.production");
const text = readFileSync(envPath, "utf8");
const env = Object.create(null);

for (const line of text.split(/\r?\n/u)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u);
  if (!match) continue;
  env[match[1]] = stripCopiedEnvQuotes(match[2]);
}

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "SITE_URL",
  "NEXT_PUBLIC_API_URL",
  "CONVEX_DEPLOYMENT",
  "NEXT_PUBLIC_CONVEX_URL",
  "CONVEX_URL",
  "NEXT_PUBLIC_CONVEX_SITE_URL",
  "CONVEX_SITE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_FRONTEND_API_URL",
  "ADMIN_CONVEX_SERVICE_TOKEN",
  "WORKSPACE_ADMIN_SERVICE_TOKEN",
  "WORKSPACE_CONVEX_BRIDGE_SECRET",
  "PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY",
  "ORGANIZATION_DATA_ENCRYPTION_KEY",
];

const expected = {
  NEXT_PUBLIC_SITE_URL: "https://app.qentrah.com",
  SITE_URL: "https://app.qentrah.com",
  NEXT_PUBLIC_API_URL: "https://app.qentrah.com",
  CONVEX_DEPLOYMENT: "focused-shepherd-801",
  NEXT_PUBLIC_CONVEX_URL: "https://focused-shepherd-801.convex.cloud",
  CONVEX_URL: "https://focused-shepherd-801.convex.cloud",
  NEXT_PUBLIC_CONVEX_SITE_URL: "https://focused-shepherd-801.convex.site",
  CONVEX_SITE_URL: "https://focused-shepherd-801.convex.site",
  PARTNER_OAUTH_ISSUER: "https://app.qentrah.com",
  PARTNER_OAUTH_AUDIENCE: "https://app.qentrah.com/api/v1/partner",
};

const removedWorkspaceVariables = [
  "WORKOS_AUTH_ENABLED",
  "WORKOS_API_KEY",
  "WORKOS_CLIENT_ID",
  "WORKOS_WEBHOOK_SECRET",
  "WORKOS_COOKIE_PASSWORD",
  "WORKOS_CALLBACK_URL",
  "WORKOS_LOGOUT_RETURN_URL",
  "WORKOS_POST_LOGIN_URL",
  "WORKOS_JWT_ISSUER",
  "WORKOS_COOKIE_DOMAIN",
  "WORKOS_COOKIE_SECURE",
  "WORKOS_API_BASE_URL",
  "WORKOS_MOBILE_CALLBACK_URL",
  "NEXT_PUBLIC_WORKOS_REDIRECT_URI",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const placeholder = /^<.*>$/u;
const failures = [];

function stripCopiedEnvQuotes(value) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return trimmed;

  const quote = trimmed[0];
  if ((quote === "'" || quote === '"') && trimmed.at(-1) === quote) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

const strongSecretKeys = [
  "ADMIN_CONVEX_SERVICE_TOKEN",
  "WORKSPACE_ADMIN_SERVICE_TOKEN",
  "WORKSPACE_CONVEX_BRIDGE_SECRET",
  "PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY",
  "ORGANIZATION_DATA_ENCRYPTION_KEY",
];

function uniqueCharacterCount(value) {
  return new Set(value).size;
}

function looksRandomSecret(value) {
  const trimmed = value.trim();
  if (trimmed.length < 32) return false;
  if (/^(.)\1+$/u.test(trimmed)) return false;
  if (/password|secret|changeme|replace|example|qentrah|test|local/iu.test(trimmed)) return false;
  return uniqueCharacterCount(trimmed) >= 12;
}

function parseUploadThingToken(value) {
  try {
    const decoded = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.apiKey !== "string" ||
      !decoded.apiKey.startsWith("sk_") ||
      typeof decoded.appId !== "string" ||
      decoded.appId.length === 0 ||
      !Array.isArray(decoded.regions) ||
      decoded.regions.length === 0 ||
      !decoded.regions.every((region) => typeof region === "string" && region.length > 0)
    ) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function isClerkPublishableKey(value) {
  return /^pk_(test|live)_[A-Za-z0-9_-]+$/.test(value || "");
}

function isClerkSecretKey(value) {
  return /^sk_(test|live)_[A-Za-z0-9_-]+$/.test(value || "");
}

for (const key of required) {
  if (!env[key]) failures.push(`${key} is missing`);
  else if (placeholder.test(env[key])) failures.push(`${key} still has a placeholder`);
}

for (const [key, value] of Object.entries(env)) {
  if (placeholder.test(value) || /set-manually|replace|changeme|example/iu.test(value)) {
    failures.push(`${key} still has a placeholder`);
  }
}

for (const key of removedWorkspaceVariables) {
  if (env[key]) failures.push(`${key} is a removed Workspace legacy variable`);
}

for (const key of strongSecretKeys) {
  if (env[key] && !looksRandomSecret(env[key])) {
    failures.push(`${key} must be a random secret with at least 32 characters.`);
  }
}

if (env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !isClerkPublishableKey(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)) {
  failures.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be a Clerk pk_test_ or pk_live_ key.");
}

if (env.CLERK_SECRET_KEY && !isClerkSecretKey(env.CLERK_SECRET_KEY)) {
  failures.push("CLERK_SECRET_KEY must be a Clerk sk_test_ or sk_live_ key.");
}

for (const [key, value] of Object.entries(expected)) {
  if (env[key] !== value) failures.push(`${key} should be ${value}`);
}

if (env.TAMARA_API_BASE_URL && env.TAMARA_API_BASE_URL !== "https://api.tamara.co") {
  failures.push("TAMARA_API_BASE_URL should be https://api.tamara.co when Tamara billing is configured.");
}

if (env.TAMARA_WEBHOOK_URL && env.TAMARA_WEBHOOK_URL !== "https://app.qentrah.com/api/v1/billing/tamara/webhook") {
  failures.push("TAMARA_WEBHOOK_URL should be https://app.qentrah.com/api/v1/billing/tamara/webhook when Tamara billing is configured.");
}

if (env.TAMARA_CAPTURE_MODE && env.TAMARA_CAPTURE_MODE !== "immediate") {
  failures.push("TAMARA_CAPTURE_MODE should be immediate when Tamara billing is configured.");
}

for (const [key, value] of Object.entries(env)) {
  if (/^https?:\/\/localhost|^http:\/\/127\.0\.0\.1/u.test(value)) {
    failures.push(`${key} still points at local development`);
  }
  if (value.includes("stoic-monitor-13")) {
    failures.push(`${key} still points at the old stoic-monitor-13 Convex deployment`);
  }
}

if (env.UPLOADTHING_TOKEN) {
  const uploadThingToken = parseUploadThingToken(env.UPLOADTHING_TOKEN);
  if (!uploadThingToken) {
    failures.push("UPLOADTHING_TOKEN must be a base64 JSON token with apiKey, appId, and regions.");
  } else {
    if (env.UPLOADTHING_APP_ID && env.UPLOADTHING_APP_ID !== uploadThingToken.appId) {
      failures.push("UPLOADTHING_APP_ID must match the appId inside UPLOADTHING_TOKEN.");
    }
    if (env.UPLOADTHING_SECRET && env.UPLOADTHING_SECRET !== uploadThingToken.apiKey) {
      failures.push("UPLOADTHING_SECRET must match the apiKey inside UPLOADTHING_TOKEN.");
    }
  }
}

if (failures.length > 0) {
  console.error("Production env check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Production env shape looks ready.");
