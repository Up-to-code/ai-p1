import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.production");
const text = readFileSync(envPath, "utf8");
const env = Object.create(null);

for (const line of text.split(/\r?\n/u)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u);
  if (!match) continue;
  env[match[1]] = match[2].trim();
}

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "SITE_URL",
  "NEXT_PUBLIC_API_URL",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_CONVEX_URL",
  "CONVEX_URL",
  "NEXT_PUBLIC_CONVEX_SITE_URL",
  "CONVEX_SITE_URL",
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "WORKSPACE_ADMIN_SERVICE_TOKEN",
  "PARTNERS_REVIEW_CALLBACK_TOKEN",
  "PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY",
];

const expected = {
  NEXT_PUBLIC_SITE_URL: "https://app.qentrah.com",
  SITE_URL: "https://app.qentrah.com",
  NEXT_PUBLIC_API_URL: "https://app.qentrah.com",
  BETTER_AUTH_URL: "https://app.qentrah.com",
  NEXT_PUBLIC_CONVEX_URL: "https://stoic-monitor-13.convex.cloud",
  CONVEX_URL: "https://stoic-monitor-13.convex.cloud",
  NEXT_PUBLIC_CONVEX_SITE_URL: "https://stoic-monitor-13.convex.site",
  CONVEX_SITE_URL: "https://stoic-monitor-13.convex.site",
  PARTNER_OAUTH_ISSUER: "https://app.qentrah.com",
  PARTNER_OAUTH_AUDIENCE: "https://app.qentrah.com/api/v1/partner",
};

const placeholder = /^<.*>$/u;
const failures = [];

for (const key of required) {
  if (!env[key]) failures.push(`${key} is missing`);
  else if (placeholder.test(env[key])) failures.push(`${key} still has a placeholder`);
}

for (const [key, value] of Object.entries(expected)) {
  if (env[key] !== value) failures.push(`${key} should be ${value}`);
}

for (const [key, value] of Object.entries(env)) {
  if (/^https?:\/\/localhost|^http:\/\/127\.0\.0\.1/u.test(value)) {
    failures.push(`${key} still points at local development`);
  }
}

if (failures.length > 0) {
  console.error("Production env check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Production env shape looks ready.");
