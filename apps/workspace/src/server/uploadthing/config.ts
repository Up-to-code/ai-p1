type UploadThingTokenPayload = {
  apiKey: string;
  appId: string;
  regions: string[];
  ingestHost?: string;
};

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

export function hydrateUploadThingEnvFromToken(env: Record<string, string | undefined> = process.env) {
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
