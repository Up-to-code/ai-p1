#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const exposedWorkOSKey = "sk_test_a2V5XzAxS0VFRFpTUlMxOVBTWjRWWUZCS0JTWks2LGZhazNqeWJaYlU1MjNFZ2Q3QVhQY2JSQmY";
const workspaceRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function loadEnvFile(fileName, { override = false } = {}) {
  const envPath = join(workspaceRoot, fileName);
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^["']|["']$/g, "");
    if (!value) continue;
    if (process.env[key] && !override) continue;
    process.env[key] = value;
  }
}

loadEnvFile(".env.production");
loadEnvFile(".env.local", { override: true });

const required = [
  "WORKOS_AUTH_ENABLED",
  "WORKOS_API_KEY",
  "WORKOS_CLIENT_ID",
  "WORKOS_COOKIE_PASSWORD",
  "NEXT_PUBLIC_WORKOS_REDIRECT_URI",
  "WORKSPACE_CONVEX_BRIDGE_SECRET",
  "PARTNERS_API_BASE_URL",
  "PARTNERS_PLATFORM_SERVICE_TOKEN",
];

const missing = required.filter((name) => !String(process.env[name] ?? "").trim());
if (missing.length) {
  console.error(`Missing required WorkOS live-flow env: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.WORKOS_AUTH_ENABLED !== "true") {
  console.error("WORKOS_AUTH_ENABLED must be true for the live WorkOS partner flow.");
  process.exit(1);
}

if (process.env.WORKOS_API_KEY === exposedWorkOSKey) {
  console.error("Refusing to use the exposed WorkOS test key. Rotate it in WorkOS and set the replacement through a secret manager.");
  process.exit(1);
}

if (!/^sk_(test|live)_/.test(process.env.WORKOS_API_KEY ?? "")) {
  console.error("WORKOS_API_KEY must look like a WorkOS sk_test_ or sk_live_ server key.");
  process.exit(1);
}

if (!/^client_/.test(process.env.WORKOS_CLIENT_ID ?? "")) {
  console.error("WORKOS_CLIENT_ID must look like a WorkOS client id.");
  process.exit(1);
}

if (String(process.env.WORKOS_COOKIE_PASSWORD ?? "").length < 32) {
  console.error("WORKOS_COOKIE_PASSWORD must be at least 32 characters.");
  process.exit(1);
}

console.log("WorkOS live partner-flow prerequisites are present and do not use the exposed key.");
