export type PartnerAppStatus = "pending" | "approved" | "rejected" | "suspended";

export type PartnerAppRecord = {
  id: string;
  partnersAppId?: string;
  partnersClientId?: string;
  oauthClientId: string;
  name: string;
  publisherName?: string;
  description: string;
  homepageUrl?: string;
  logoUrl?: string;
  redirectUris: string[];
  allowedScopes: string[];
  status: PartnerAppStatus;
  reviewNotes?: string;
  reviewedAt?: number;
  createdAt: number;
  updatedAt: number;
};

function normalizeBaseUrl(value?: string) {
  const trimmed = value?.trim().replace(/\/+$/u, "");
  if (!trimmed) return "http://localhost:3000";
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function hubAdminConfig(env: Record<string, string | undefined> = process.env) {
  return {
    baseUrl: normalizeBaseUrl(env.HUB_API_BASE_URL),
    token: env.HUB_ADMIN_SERVICE_TOKEN?.trim() ?? "",
  };
}

async function hubFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = hubAdminConfig();
  if (!config.token) throw new Error("Set HUB_ADMIN_SERVICE_TOKEN before using the admin review app.");
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as T & { error?: string };
  if (!response.ok) throw new Error(payload?.error ?? "Hub API request failed.");
  return payload;
}

export async function listPartnerApps() {
  const payload = await hubFetch<{ apps: PartnerAppRecord[] }>("/api/v1/admin/partner-apps");
  return payload.apps;
}

export async function reviewPartnerApp(appId: string, input: { status: PartnerAppStatus; reviewNotes?: string }) {
  return hubFetch<{ app: PartnerAppRecord }>(`/api/v1/admin/partner-apps/${encodeURIComponent(appId)}/review`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
