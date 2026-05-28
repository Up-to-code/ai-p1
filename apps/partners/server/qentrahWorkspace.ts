import { brandEnvName, brandProductName, readBrandEnv } from "@qentrah/brand-identity";
import {
  buildOAuthRuntimeProjectionInput,
  normalizeOAuthRuntimeScopes,
  type OAuthRuntimeProjectionStatus,
  oauthRuntimeProjectionResponseSchema,
} from "@qentrah/partner-workspace-sync";

import type { PartnerAppSummary } from "@/server/partnerApps";

export type OAuthRuntimeProjectionSource = {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  description?: string | null;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  logoUrl?: string | null;
  clientType: "public" | "confidential";
  redirectUris: string[];
  allowedScopes: string[];
  status: string;
};

function normalizeBaseUrl(value?: string) {
  const trimmed = value?.trim().replace(/\/+$/u, "");
  if (!trimmed) return "";
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function qentrahWorkspaceConfig(env: Record<string, string | undefined> = process.env) {
  return {
    baseUrl: normalizeBaseUrl(readBrandEnv("WORKSPACE_API_URL", env) ?? readBrandEnv("PLATFORM_API_URL", env)),
    serviceToken: readBrandEnv("PLATFORM_SERVICE_TOKEN", env) ?? readBrandEnv("WORKSPACE_SERVICE_TOKEN", env) ?? "",
  };
}

export function normalizeWorkspaceScopes(scopes: string[]) {
  return normalizeOAuthRuntimeScopes(scopes);
}

export async function syncOAuthClientRuntimeProjection(
  app: OAuthRuntimeProjectionSource | PartnerAppSummary,
  options: { status?: OAuthRuntimeProjectionStatus } = {},
) {
  const config = qentrahWorkspaceConfig();
  if (!config.baseUrl || !config.serviceToken) {
    throw new Error(`Set ${brandEnvName("WORKSPACE_API_URL")} and ${brandEnvName("PLATFORM_SERVICE_TOKEN")} to sync OAuth client runtime state.`);
  }

  const projection = buildOAuthRuntimeProjectionInput({
    ...app,
    description: `${app.publisherName} partner app submitted from ${brandProductName("partners", "en")}.`,
    status: options.status ?? app.status,
  });
  if (projection.allowedScopes.length === 0) {
    throw new Error("Select at least one Workspace partner API scope before syncing this app.");
  }

  const response = await fetch(`${config.baseUrl}/api/v1/admin/oauth-client-runtime-sync`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.serviceToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(projection),
  });

  const payload = await response.json().catch(() => null);
  const parsed = oauthRuntimeProjectionResponseSchema.safeParse(payload);
  if (!response.ok || !parsed.success) {
    const errorMessage = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : undefined;
    throw new Error(errorMessage || "Workspace OAuth runtime sync failed.");
  }

  return parsed.data.runtime;
}
