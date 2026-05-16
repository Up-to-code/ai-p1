import type {
  AdminActionResponse,
  AdminAuditEvent,
  AdminDetailResponse,
  AdminDomainId,
  AdminListRequest,
  AdminListResponse,
  AdminRecordSummary,
} from "./admin-contracts";
import type { AdminIdentity } from "./admin-auth";

type PartnersAdminApp = {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  description: string;
  homepageUrl?: string | null;
  logoUrl?: string | null;
  iconUrl?: string | null;
  clientType: "public" | "confidential";
  redirectUris: string[];
  allowedScopes: string[];
  status: "pending" | "approved" | "rejected" | "suspended";
  reviewNotes?: string | null;
  submittedAt?: number | null;
  reviewedAt?: number | null;
  createdAt: number;
  updatedAt: number;
};

function partnersConfig(env: Record<string, string | undefined> = process.env) {
  return {
    baseUrl: (env.PARTNERS_API_BASE_URL ?? env.NEXT_PUBLIC_PARTNERS_AUTH_URL ?? "").trim().replace(/\/+$/u, ""),
    serviceToken: (env.PARTNERS_ADMIN_SERVICE_TOKEN ?? "").trim(),
  };
}

export function partnersAdminConfigured(env: Record<string, string | undefined> = process.env) {
  const config = partnersConfig(env);
  return Boolean(config.baseUrl && config.serviceToken);
}

function appRecord(app: PartnersAdminApp, domain: AdminDomainId = "apps"): AdminRecordSummary {
  return {
    id: app.id,
    title: app.name,
    subtitle: app.publisherName || app.clientId,
    status: app.status,
    href: `/${domain}/${app.id}`,
    updatedAt: app.updatedAt,
    fields: [
      { label: "Logo", value: app.logoUrl ?? app.iconUrl ?? "" },
      { label: "Homepage", value: app.homepageUrl ?? "" },
      { label: "OAuth client", value: app.clientId },
      { label: "Publisher", value: app.publisherName },
      { label: "Client type", value: app.clientType },
      { label: "Scopes", value: String(app.allowedScopes.length) },
      { label: "Redirect URIs", value: String(app.redirectUris.length) },
      { label: "Review notes", value: app.reviewNotes ?? "not set" },
    ],
  };
}

function auditFor(app: PartnersAdminApp, actor?: string): AdminAuditEvent[] {
  return [
    {
      id: `${app.id}:partners-source`,
      actor: "partners",
      action: "admin.partner_app.source",
      summary: "Loaded from Partners source of truth.",
      createdAt: app.updatedAt,
    },
    {
      id: `${app.id}:inspect`,
      actor: actor ?? "admin",
      action: "admin.record.inspect",
      summary: `Viewed ${app.name}.`,
      createdAt: Date.now(),
    },
  ];
}

async function partnersFetch(path: string, init: RequestInit = {}) {
  const config = partnersConfig();
  if (!config.baseUrl || !config.serviceToken) {
    throw new Error("PARTNERS_API_BASE_URL and PARTNERS_ADMIN_SERVICE_TOKEN are required for partner app admin review.");
  }
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${config.serviceToken}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : "Partners admin API request failed.";
    throw new Error(message);
  }
  return payload;
}

export async function listPartnerAppsFromPartners(domain: AdminDomainId, request: AdminListRequest = {}): Promise<AdminListResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(Math.min(request.limit ?? request.pageSize ?? 50, 100)));
  if (request.cursor) params.set("cursor", request.cursor);
  if (request.search) params.set("search", request.search);
  const payload = await partnersFetch(`/api/admin/partner-apps?${params}`) as {
    apps: PartnersAdminApp[];
    nextCursor?: string;
    isDone: boolean;
  };
  const rows = payload.apps.map((app) => appRecord(app, domain));
  return {
    domain,
    rows,
    total: rows.length,
    page: request.page ?? 1,
    pageSize: Math.min(request.limit ?? request.pageSize ?? 50, 100),
    isDone: payload.isDone,
    continueCursor: payload.nextCursor ?? "",
    facets: Array.from(new Set(rows.map((row) => row.status))).map((status) => ({
      id: status,
      label: status,
      value: status,
      count: rows.filter((row) => row.status === status).length,
    })),
    warnings: [],
  };
}

export async function getPartnerAppDetailFromPartners(domain: AdminDomainId, id: string, identity?: AdminIdentity): Promise<AdminDetailResponse | null> {
  const payload = await partnersFetch(`/api/admin/partner-apps/${encodeURIComponent(id)}`) as { app: PartnersAdminApp };
  const app = payload.app;
  return {
    domain,
    record: {
      ...appRecord(app, domain),
      fields: [
        ...appRecord(app, domain).fields,
        { label: "Description", value: app.description },
        { label: "Allowed scopes", value: app.allowedScopes.join(", ") },
        { label: "Redirect URIs", value: app.redirectUris.join(", ") },
        { label: "Source of truth", value: "Partners" },
      ],
    },
    related: [],
    sections: [],
    notifications: [],
    auditTimeline: auditFor(app, identity?.email),
    availableActions: [],
  };
}

export async function reviewPartnerAppThroughPartners(input: {
  appId: string;
  status: "approved" | "rejected" | "suspended";
  reviewNotes?: string;
  identity: AdminIdentity;
}): Promise<AdminActionResponse> {
  const payload = await partnersFetch(`/api/admin/partner-apps/${encodeURIComponent(input.appId)}/review`, {
    method: "PATCH",
    headers: { "x-qentrah-admin-actor": input.identity.email },
    body: JSON.stringify({
      status: input.status,
      reviewNotes: input.reviewNotes,
    }),
  }) as { app: PartnersAdminApp };

  return {
    record: appRecord(payload.app),
    auditId: `partners:${payload.app.id}:${payload.app.reviewedAt ?? Date.now()}`,
    nextState: `${payload.app.status}. Review saved in Partners source of truth. Reviewer: ${input.identity.email}`,
  };
}
