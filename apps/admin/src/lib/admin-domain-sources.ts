import type {
  AdminActionRequest,
  AdminActionResponse,
  AdminDetailResponse,
  AdminDomainId,
  AdminListRequest,
  AdminListResponse,
  AdminRecordSummary,
} from "./admin-contracts";
import type { AdminIdentity } from "./admin-auth";
import { adminSecurityConfig, redactSecret } from "./security";
import { adminConvexConfigured, getAdminDomainDetailFromConvex, listAdminDomainFromConvex, runAdminDomainActionInConvex } from "./admin-convex";
import { getPartnerAppDetailFromPartners, listPartnerAppsFromPartners, partnersAdminConfigured, reviewPartnerAppThroughPartners } from "./partners";

export type AdminDomainSource = {
  configured: () => boolean;
  list: (domain: AdminDomainId, request?: AdminListRequest) => Promise<AdminListResponse>;
  detail: (domain: AdminDomainId, id: string, identity?: AdminIdentity) => Promise<AdminDetailResponse | null>;
  action?: (domain: AdminDomainId, request: AdminActionRequest, identity: AdminIdentity) => Promise<AdminActionResponse>;
};

function row(domain: AdminDomainId, id: string, title: string, subtitle: string, status: AdminRecordSummary["status"], fields: AdminRecordSummary["fields"], updatedAt = Date.now()): AdminRecordSummary {
  return { id, title, subtitle, status, href: `/${domain}/${id}`, updatedAt, fields };
}

function securityRows(): AdminRecordSummary[] {
  const security = adminSecurityConfig();
  return [
    row("security", "trusted-origins", "Trusted origins", security.trustedOrigins.join(", "), "active", [
      { label: "Production Admin", value: "https://admin.qentrah.com" },
      { label: "Production Workspace", value: "https://app.qentrah.com" },
      { label: "Configured origins", value: String(security.trustedOrigins.length) },
    ]),
    row("security", "convex-admin-service", "Admin Convex service", adminConvexConfigured() ? "Connected server-side" : "Missing Convex admin env", adminConvexConfigured() ? "active" : "danger", [
      { label: "CONVEX_URL", value: process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL ?? "not configured", secret: true },
      { label: "Service token", value: redactSecret(process.env.ADMIN_CONVEX_SERVICE_TOKEN), secret: true },
      { label: "Browser exposure", value: "Never sent to client" },
    ]),
    row("security", "platform-admin-source", "Platform admin source", "Read-only operator-controlled env/DB", "active", [
      { label: "Configured admins", value: String(security.platformAdminEmails.length) },
      { label: "Promotion UI", value: "Disabled" },
    ]),
  ];
}

function filterRows(rows: AdminRecordSummary[], search?: string) {
  const normalized = search?.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((record) => [record.title, record.subtitle, record.status, ...record.fields.map((field) => `${field.label} ${field.value}`)].join(" ").toLowerCase().includes(normalized));
}

function unavailableList(domain: AdminDomainId, message: string): AdminListResponse {
  return {
    domain,
    rows: [],
    total: 0,
    page: 1,
    pageSize: 50,
    isDone: true,
    continueCursor: "",
    facets: [],
    warnings: [message],
  };
}

export const localSecurityAdminSource: AdminDomainSource = {
  configured: () => true,
  async list(domain, request = {}) {
    const rows = filterRows(securityRows(), request.search);
    return {
      domain,
      rows,
      total: rows.length,
      page: request.page ?? 1,
      pageSize: Math.min(request.limit ?? request.pageSize ?? 50, 100),
      isDone: true,
      continueCursor: "",
      facets: [],
      warnings: [],
    };
  },
  async detail(domain, id, identity) {
    const record = securityRows().find((candidate) => candidate.id === id);
    if (!record) return null;
    return {
      domain,
      record,
      related: securityRows().filter((candidate) => candidate.id !== id),
      sections: [],
      notifications: [],
      auditTimeline: [{
        id: `${record.id}:inspect`,
        actor: identity?.email ?? "system",
        action: "admin.record.inspect",
        summary: `Viewed ${record.title}.`,
        createdAt: Date.now(),
      }],
      availableActions: [],
    };
  },
};

export const partnersAdminSource: AdminDomainSource = {
  configured: partnersAdminConfigured,
  list: listPartnerAppsFromPartners,
  detail: getPartnerAppDetailFromPartners,
  async action(_domain, request, identity) {
    if (!["approved", "rejected", "suspended"].includes(request.actionId)) {
      throw new Error("This partner app action is not available through Partners.");
    }
    if (!partnersAdminConfigured()) {
      throw new Error("Partners admin API is not configured. Set PARTNERS_API_BASE_URL and PARTNERS_ADMIN_SERVICE_TOKEN.");
    }
    return reviewPartnerAppThroughPartners({
      appId: request.targetId,
      status: request.actionId as "approved" | "rejected" | "suspended",
      reviewNotes: request.reason,
      identity,
    });
  },
};

export const workspaceConvexAdminSource: AdminDomainSource = {
  configured: adminConvexConfigured,
  async list(domain, request = {}) {
    if (!adminConvexConfigured()) {
      return unavailableList(domain, "Admin Convex real-data adapter is not configured. Set CONVEX_URL and ADMIN_CONVEX_SERVICE_TOKEN.");
    }
    try {
      return await listAdminDomainFromConvex(domain, request);
    } catch (error) {
      return unavailableList(domain, error instanceof Error ? error.message : "Admin Convex real-data adapter failed.");
    }
  },
  async detail(domain, id, identity) {
    if (!adminConvexConfigured()) return null;
    return getAdminDomainDetailFromConvex(domain, id, identity);
  },
  async action(domain, request, identity) {
    if (!adminConvexConfigured()) throw new Error("Admin Convex real-data adapter is not configured.");
    return runAdminDomainActionInConvex(domain, request, identity);
  },
};

export function adminSourceForDomain(domain: AdminDomainId) {
  if (domain === "security") return localSecurityAdminSource;
  if ((domain === "apps" || domain === "oauth-clients") && partnersAdminConfigured()) return partnersAdminSource;
  return workspaceConvexAdminSource;
}
