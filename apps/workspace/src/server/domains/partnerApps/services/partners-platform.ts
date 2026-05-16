import {
  partnerAuthorizationVerificationResponseSchema,
  partnerSyncLog,
  publishedPartnerAppsResponseSchema,
  type PartnerAuthorizationVerificationRequest,
  type PartnerAuthorizationVerificationResponse,
  type PublishedPartnerApp,
} from "@qentrah/partner-workspace-sync";

type PartnersPlatformEnv = Record<string, string | undefined>;

let cachedCatalog: { expiresAt: number; payload: PublishedPartnerApp[] } | null = null;

function normalizeBaseUrl(value?: string) {
  return value?.trim().replace(/\/+$/u, "") ?? "";
}

export function partnersPlatformConfig(env: PartnersPlatformEnv = process.env) {
  return {
    baseUrl: normalizeBaseUrl(env.PARTNERS_API_BASE_URL ?? env.NEXT_PUBLIC_PARTNERS_AUTH_URL),
    serviceToken: (
      env.PARTNERS_PLATFORM_SERVICE_TOKEN ??
      env.QENTRAH_PLATFORM_SERVICE_TOKEN ??
      env.WORKSPACE_SERVICE_TOKEN ??
      ""
    ).trim(),
    cacheTtlMs: Number(env.PARTNERS_CATALOG_CACHE_TTL_MS ?? 60_000),
  };
}

async function partnersFetch(path: string, init: RequestInit = {}) {
  const config = partnersPlatformConfig();
  if (!config.baseUrl || !config.serviceToken) {
    throw new Error("PARTNERS_API_BASE_URL and PARTNERS_PLATFORM_SERVICE_TOKEN are required.");
  }
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${config.serviceToken}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : "Partners platform API request failed.";
    throw new Error(message);
  }
  return payload;
}

export async function listPublishedPartnerApps() {
  const config = partnersPlatformConfig();
  const now = Date.now();
  if (cachedCatalog && cachedCatalog.expiresAt > now) return cachedCatalog.payload;

  try {
    const payload = publishedPartnerAppsResponseSchema.parse(
      await partnersFetch("/api/platform/published-apps?limit=200"),
    );
    cachedCatalog = { expiresAt: now + config.cacheTtlMs, payload: payload.apps };
    return payload.apps;
  } catch (error) {
    if (cachedCatalog) {
      console.warn(partnerSyncLog("partners.catalog.stale", {
        error: error instanceof Error ? error.message : "unknown",
      }));
      return cachedCatalog.payload;
    }
    throw error;
  }
}

export async function verifyPartnerAuthorization(
  input: PartnerAuthorizationVerificationRequest,
): Promise<PartnerAuthorizationVerificationResponse> {
  const payload = await partnersFetch("/api/platform/verify-authorization", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return partnerAuthorizationVerificationResponseSchema.parse(payload);
}
