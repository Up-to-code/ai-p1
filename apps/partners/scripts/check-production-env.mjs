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
  "SITE_URL",
  "NEXT_PUBLIC_PARTNERS_AUTH_URL",
  "BETTER_AUTH_URL",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "PARTNER_SIGNUP_BRIDGE_SECRET",
  "QENTRAH_WORKSPACE_API_URL",
  "QENTRAH_PLATFORM_API_URL",
  "QENTRAH_PLATFORM_SERVICE_TOKEN",
  "QENTRAH_WORKSPACE_SERVICE_TOKEN",
  "PARTNERS_REVIEW_CALLBACK_TOKEN",
];

const expected = {
  SITE_URL: "https://partners.qentrah.com",
  NEXT_PUBLIC_SITE_URL: "https://partners.qentrah.com",
  NEXT_PUBLIC_PARTNERS_AUTH_URL: "https://partners.qentrah.com",
  BETTER_AUTH_URL: "https://partners.qentrah.com",
  QENTRAH_WORKSPACE_API_URL: "https://app.qentrah.com",
  QENTRAH_PLATFORM_API_URL: "https://app.qentrah.com",
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

if (env.BETTER_AUTH_SECRET && !placeholder.test(env.BETTER_AUTH_SECRET) && env.BETTER_AUTH_SECRET.length < 32) {
  failures.push("BETTER_AUTH_SECRET must be at least 32 characters");
}

if (env.PARTNER_SIGNUP_BRIDGE_SECRET && !placeholder.test(env.PARTNER_SIGNUP_BRIDGE_SECRET) && env.PARTNER_SIGNUP_BRIDGE_SECRET.length < 32) {
  failures.push("PARTNER_SIGNUP_BRIDGE_SECRET must be at least 32 characters");
}

if (failures.length > 0) {
  console.error("Partners production env check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Partners production env shape looks ready.");
