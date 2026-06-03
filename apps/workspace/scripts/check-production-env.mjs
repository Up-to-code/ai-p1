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
  "NEXT_PUBLIC_CONVEX_URL",
  "CONVEX_URL",
  "NEXT_PUBLIC_CONVEX_SITE_URL",
  "CONVEX_SITE_URL",
  "ADMIN_CONVEX_SERVICE_TOKEN",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "WORKOS_AUTH_ENABLED",
  "WORKOS_API_KEY",
  "WORKOS_CLIENT_ID",
  "WORKOS_WEBHOOK_SECRET",
  "WORKOS_COOKIE_PASSWORD",
  "WORKSPACE_ADMIN_SERVICE_TOKEN",
  "WORKSPACE_CONVEX_BRIDGE_SECRET",
  "PARTNERS_REVIEW_CALLBACK_TOKEN",
  "PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY",
  "ORGANIZATION_DATA_ENCRYPTION_KEY",
  "UPLOADTHING_TOKEN",
  "UPLOADTHING_SECRET",
  "UPLOADTHING_APP_ID",
  "TAMARA_API_BASE_URL",
  "TAMARA_API_TOKEN",
  "TAMARA_NOTIFICATION_TOKEN",
  "TAMARA_PUBLIC_KEY",
  "TAMARA_WEBHOOK_URL",
  "TAMARA_CAPTURE_MODE",
];

const expected = {
  NEXT_PUBLIC_SITE_URL: "https://app.qentrah.com",
  SITE_URL: "https://app.qentrah.com",
  NEXT_PUBLIC_API_URL: "https://app.qentrah.com",
  NEXT_PUBLIC_CONVEX_URL: "https://stoic-monitor-13.convex.cloud",
  CONVEX_URL: "https://stoic-monitor-13.convex.cloud",
  NEXT_PUBLIC_CONVEX_SITE_URL: "https://stoic-monitor-13.convex.site",
  CONVEX_SITE_URL: "https://stoic-monitor-13.convex.site",
  PARTNER_OAUTH_ISSUER: "https://app.qentrah.com",
  PARTNER_OAUTH_AUDIENCE: "https://app.qentrah.com/api/v1/partner",
  TAMARA_API_BASE_URL: "https://api.tamara.co",
  TAMARA_WEBHOOK_URL: "https://app.qentrah.com/api/v1/billing/tamara/webhook",
  TAMARA_CAPTURE_MODE: "immediate",
};

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
  "WORKOS_API_KEY",
  "WORKOS_WEBHOOK_SECRET",
  "WORKOS_COOKIE_PASSWORD",
  "WORKSPACE_ADMIN_SERVICE_TOKEN",
  "WORKSPACE_CONVEX_BRIDGE_SECRET",
  "PARTNERS_REVIEW_CALLBACK_TOKEN",
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

for (const key of required) {
  if (!env[key]) failures.push(`${key} is missing`);
  else if (placeholder.test(env[key])) failures.push(`${key} still has a placeholder`);
}

for (const key of strongSecretKeys) {
  if (env[key] && !looksRandomSecret(env[key])) {
    failures.push(`${key} must be a random secret with at least 32 characters.`);
  }
}

for (const [key, value] of Object.entries(expected)) {
  if (env[key] !== value) failures.push(`${key} should be ${value}`);
}

for (const [key, value] of Object.entries(env)) {
  if (/^https?:\/\/localhost|^http:\/\/127\.0\.0\.1/u.test(value)) {
    failures.push(`${key} still points at local development`);
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
