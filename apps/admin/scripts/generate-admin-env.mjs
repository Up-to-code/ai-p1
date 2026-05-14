#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { resolve } from "node:path";

const envPath = resolve(import.meta.dirname, "../.env.local");
const workspaceEnvPath = resolve(import.meta.dirname, "../../workspace/.env.local");
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%^*_+-=";

function randomString(length) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function setEnvValue(source, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(source)) return source.replace(pattern, line);
  return `${source.trimEnd()}\n${line}\n`;
}

function readEnvValue(source, key) {
  const match = source.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match?.[1]?.trim();
}

const password = randomString(32);
const passwordHash = sha256(password);
const sessionSecret = randomBytes(48).toString("base64url");
const currentEnv = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const workspaceEnv = existsSync(workspaceEnvPath) ? readFileSync(workspaceEnvPath, "utf8") : "";

let nextEnv = currentEnv;
nextEnv = setEnvValue(nextEnv, "ADMIN_AUTH_SECRET", sessionSecret);
nextEnv = setEnvValue(nextEnv, "ADMIN_AUTH_EMAIL", "admin@qentrah.local");
nextEnv = setEnvValue(nextEnv, "ADMIN_AUTH_PASSWORD_SHA256", passwordHash);
nextEnv = setEnvValue(nextEnv, "PLATFORM_ADMIN_EMAILS", "admin@qentrah.local");

const convexUrl = readEnvValue(workspaceEnv, "CONVEX_URL") ?? readEnvValue(workspaceEnv, "NEXT_PUBLIC_CONVEX_URL");
const publicConvexUrl = readEnvValue(workspaceEnv, "NEXT_PUBLIC_CONVEX_URL") ?? convexUrl;
const serviceToken = readEnvValue(workspaceEnv, "ADMIN_CONVEX_SERVICE_TOKEN") ?? readEnvValue(workspaceEnv, "WORKSPACE_ADMIN_SERVICE_TOKEN");
if (convexUrl) nextEnv = setEnvValue(nextEnv, "CONVEX_URL", convexUrl);
if (publicConvexUrl) nextEnv = setEnvValue(nextEnv, "NEXT_PUBLIC_CONVEX_URL", publicConvexUrl);
if (serviceToken) {
  nextEnv = setEnvValue(nextEnv, "ADMIN_CONVEX_SERVICE_TOKEN", serviceToken);
  nextEnv = setEnvValue(nextEnv, "WORKSPACE_ADMIN_SERVICE_TOKEN", serviceToken);
}

writeFileSync(envPath, `${nextEnv.trimEnd()}\n`);

console.log("Admin local credentials generated.");
console.log(`Email: admin@qentrah.local`);
console.log(`Password: ${password}`);
console.log("Only the SHA-256 password hash was written to apps/admin/.env.local.");
console.log(convexUrl ? "Copied Workspace Convex URL into Admin env." : "Workspace Convex URL was not found.");
console.log(serviceToken ? "Copied Workspace admin service token into Admin env." : "Workspace admin service token was not found.");
