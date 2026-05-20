import {
  partnerAuthorizationVerificationResponseSchema,
  partnerSyncLog,
  publishedPartnerAppsResponseSchema,
  type PartnerAuthorizationVerificationRequest,
  type PartnerAuthorizationVerificationResponse,
  type PublishedPartnerApp,
} from "@qentrah/partner-workspace-sync";
import { oauthDebug } from "./oauth-debug";

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
    oauthDebug("workspace.partners_platform.config.missing", {
      path,
      hasBaseUrl: Boolean(config.baseUrl),
      hasServiceToken: Boolean(config.serviceToken),
    });
    throw new Error("PARTNERS_API_BASE_URL and PARTNERS_PLATFORM_SERVICE_TOKEN are required.");
  }
  oauthDebug("workspace.partners_platform.fetch.start", {
    path,
    method: init.method ?? "GET",
    cacheTtlMs: config.cacheTtlMs,
  });
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${config.serviceToken}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  oauthDebug("workspace.partners_platform.fetch.response", {
    path,
    method: init.method ?? "GET",
    status: response.status,
    ok: response.ok,
  });
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
  if (cachedCatalog && cachedCatalog.expiresAt > now) {
    oauthDebug("workspace.partners_catalog.cache.hit", {
      appCount: cachedCatalog.payload.length,
      expiresInMs: cachedCatalog.expiresAt - now,
    });
    return cachedCatalog.payload;
  }

  try {
    const payload = publishedPartnerAppsResponseSchema.parse(
      await partnersFetch("/api/platform/published-apps?limit=200"),
    );
    cachedCatalog = { expiresAt: now + config.cacheTtlMs, payload: payload.apps };
    oauthDebug("workspace.partners_catalog.fetch.success", {
      appCount: payload.apps.length,
      cacheTtlMs: config.cacheTtlMs,
    });
    return payload.apps;
  } catch (error) {
    if (cachedCatalog) {
      oauthDebug("workspace.partners_catalog.cache.stale", {
        appCount: cachedCatalog.payload.length,
        error: error instanceof Error ? error.message : "unknown",
      });
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
  oauthDebug("workspace.partners_authorization.verify.start", {
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    redirectUri: input.redirectUri,
    scopeCount: input.scopes.length,
  });
  const payload = await partnersFetch("/api/platform/verify-authorization", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const verification = partnerAuthorizationVerificationResponseSchema.parse(payload);
  oauthDebug("workspace.partners_authorization.verify.response", {
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    allowed: verification.allowed,
    reason: verification.reason,
  });
  return verification;
}
