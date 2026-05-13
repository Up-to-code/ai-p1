import type { PartnerAppSummary } from "@/server/partnerApps";

type WorkspaceRegistrationResponse = {
  app: {
    id: string;
    oauthClientId: string;
    status: "pending" | "approved" | "rejected" | "suspended";
  };
};

function normalizeBaseUrl(value?: string) {
  const trimmed = value?.trim().replace(/\/+$/u, "");
  if (!trimmed) return "";
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function ananWorkspaceConfig(env: Record<string, string | undefined> = process.env) {
  return {
    baseUrl: normalizeBaseUrl(env.ANAN_WORKSPACE_API_URL ?? env.ANAN_PLATFORM_API_URL),
    serviceToken: env.ANAN_PLATFORM_SERVICE_TOKEN?.trim() ?? env.ANAN_WORKSPACE_SERVICE_TOKEN?.trim() ?? "",
    callbackBaseUrl: normalizeBaseUrl(env.SITE_URL ?? env.NEXT_PUBLIC_PARTNERS_AUTH_URL ?? "http://localhost:3002"),
  };
}

const legacyScopeMap: Record<string, string | null> = {
  "clients:read_own": "client:read",
  "properties:read_own": "property:read",
  "organization:read_own": "organization:read",
  openid: null,
  profile: null,
  email: null,
  offline_access: null,
};

export function normalizeWorkspaceScopes(scopes: string[]) {
  return Array.from(
    new Set(
      scopes
        .map((scope) => (Object.hasOwn(legacyScopeMap, scope) ? legacyScopeMap[scope] : scope))
        .filter((scope): scope is string => Boolean(scope)),
    ),
  );
}

export async function submitPartnerAppRegistration(app: PartnerAppSummary) {
  const config = ananWorkspaceConfig();
  if (!config.baseUrl || !config.serviceToken) {
    throw new Error("Set ANAN_WORKSPACE_API_URL and ANAN_PLATFORM_SERVICE_TOKEN to sync app review submissions.");
  }

  const allowedScopes = normalizeWorkspaceScopes(app.allowedScopes);
  if (allowedScopes.length === 0) {
    throw new Error("Select at least one Workspace partner API scope before syncing this app.");
  }

  const response = await fetch(`${config.baseUrl}/api/v1/admin/partner-app-registrations`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.serviceToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      partnersAppId: app.id,
      partnersClientId: app.clientId,
      name: app.name,
      publisherName: app.publisherName,
      description: `${app.publisherName} partner app submitted from Anan Partners.`,
      homepageUrl: app.homepageUrl ?? undefined,
      logoUrl: app.logoUrl ?? app.iconUrl ?? undefined,
      redirectUris: app.redirectUris,
      allowedScopes,
      clientType: app.clientType,
      callbackUrl: `${config.callbackBaseUrl}/api/anan-review-callback`,
    }),
  });

  const payload = await response.json().catch(() => null) as WorkspaceRegistrationResponse | { error?: string } | null;
  if (!response.ok || !payload || !("app" in payload)) {
    const errorMessage = payload && "error" in payload ? payload.error : undefined;
    throw new Error(errorMessage || "Workspace registration sync failed.");
  }

  return payload.app;
}
