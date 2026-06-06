import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type UploadThingTokenPayload = {
  apiKey: string;
  appId: string;
  regions: string[];
  ingestHost?: string;
};

const uploadThingEnvKeys = new Set(["UPLOADTHING_TOKEN", "UPLOADTHING_SECRET", "UPLOADTHING_APP_ID"]);

function stripCopiedEnvQuotes(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return trimmed;

  const quote = trimmed[0];
  if ((quote === "'" || quote === '"') && trimmed.at(-1) === quote) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function isUploadThingTokenPayload(value: unknown): value is UploadThingTokenPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<UploadThingTokenPayload>;
  return (
    typeof payload.apiKey === "string" &&
    payload.apiKey.startsWith("sk_") &&
    typeof payload.appId === "string" &&
    payload.appId.length > 0 &&
    Array.isArray(payload.regions) &&
    payload.regions.length > 0 &&
    payload.regions.every((region) => typeof region === "string" && region.length > 0)
  );
}

export function parseUploadThingToken(token: string): UploadThingTokenPayload {
  const normalizedToken = stripCopiedEnvQuotes(token);
  const payload = JSON.parse(Buffer.from(normalizedToken, "base64").toString("utf8")) as unknown;

  if (!isUploadThingTokenPayload(payload)) {
    throw new Error("UPLOADTHING_TOKEN must decode to { apiKey: string, appId: string, regions: string[] }.");
  }

  return payload;
}

export function normalizeUploadThingToken(token: string) {
  const normalizedToken = stripCopiedEnvQuotes(token);
  parseUploadThingToken(normalizedToken);
  return normalizedToken;
}

function parseEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const normalized = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trimStart() : trimmed;
  const equalsIndex = normalized.indexOf("=");
  if (equalsIndex <= 0) return null;

  const key = normalized.slice(0, equalsIndex).trim();
  if (!uploadThingEnvKeys.has(key)) return null;

  const value = stripCopiedEnvQuotes(normalized.slice(equalsIndex + 1));
  if (!value) return null;

  return { key, value };
}

function hydrateUploadThingEnvFromProductionFile(env: Record<string, string | undefined> = process.env) {
  if (env.UPLOADTHING_TOKEN) return;

  const productionEnvPath = join(process.cwd(), ".env.production");
  if (!existsSync(productionEnvPath)) return;

  try {
    for (const line of readFileSync(productionEnvPath, "utf8").split(/\r?\n/u)) {
      const entry = parseEnvLine(line);
      if (!entry || env[entry.key]) continue;
      env[entry.key] = entry.value;
    }
  } catch {
    // UploadThing will report the missing token if the local fallback cannot be read.
  }
}

export function hydrateUploadThingEnvFromToken(env: Record<string, string | undefined> = process.env) {
  hydrateUploadThingEnvFromProductionFile(env);

  const token = env.UPLOADTHING_TOKEN?.trim();
  if (!token) return;

  try {
    const normalizedToken = normalizeUploadThingToken(token);
    const payload = parseUploadThingToken(normalizedToken);

    env.UPLOADTHING_TOKEN = normalizedToken;

    if (!env.UPLOADTHING_SECRET) {
      env.UPLOADTHING_SECRET = payload.apiKey;
    }
    if (!env.UPLOADTHING_APP_ID) {
      env.UPLOADTHING_APP_ID = payload.appId;
    }
  } catch {
    // UploadThing will surface its own configuration error without exposing secret values.
  }
}
