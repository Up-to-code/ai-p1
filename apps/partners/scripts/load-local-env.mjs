import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, "..");
const repoRoot = resolve(appDir, "../..");

function stripInlineComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if ((char === "\"" || char === "'") && value[index - 1] !== "\\") {
      quote = quote === char ? null : quote ?? char;
    }
    if (char === "#" && quote === null && /\s/u.test(value[index - 1] ?? "")) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

export function parseEnvFile(source) {
  const parsed = {};
  for (const rawLine of source.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalized = line.startsWith("export ") ? line.slice("export ".length).trimStart() : line;
    const equalsIndex = normalized.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, equalsIndex).trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/u.test(key)) {
      continue;
    }

    let value = stripInlineComment(normalized.slice(equalsIndex + 1).trim());
    const quote = value[0];
    if ((quote === "\"" || quote === "'") && value.endsWith(quote)) {
      value = value.slice(1, -1);
    }
    if (quote === "\"") {
      value = value.replaceAll("\\n", "\n").replaceAll("\\r", "\r").replaceAll("\\t", "\t");
    }
    parsed[key] = value;
  }
  return parsed;
}

export function loadLocalEnv(options = {}) {
  const initialKeys = new Set(Object.keys(process.env));
  const files = options.files ?? [
    resolve(repoRoot, ".env"),
    resolve(repoRoot, ".env.local"),
    resolve(appDir, ".env"),
    resolve(appDir, ".env.local"),
  ];
  const loaded = [];

  for (const file of files) {
    if (!existsSync(file)) {
      continue;
    }
    const parsed = parseEnvFile(readFileSync(file, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (!initialKeys.has(key)) {
        process.env[key] = value;
      }
    }
    loaded.push(file);
  }

  return loaded;
}

export function ensurePartnerConvexEnv() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL?.trim() && process.env.CONVEX_URL?.trim()) {
    process.env.NEXT_PUBLIC_CONVEX_URL = process.env.CONVEX_URL.trim();
  }
  if (!process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim() && process.env.CONVEX_SITE_URL?.trim()) {
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL = process.env.CONVEX_SITE_URL.trim();
  }
}
