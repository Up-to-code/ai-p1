import { createHash, randomUUID } from "node:crypto";
import type {
  AdminAction,
  AdminActionRequest,
  AdminActionResponse,
  AdminAuditEvent,
  AdminDetailResponse,
  AdminDomainId,
  AdminListRequest,
  AdminListResponse,
  AdminRecordStatus,
  AdminRecordSummary,
} from "./admin-contracts";
import type { AdminIdentity } from "./admin-auth";
import { canMutateAdminResources, type AdminRole } from "./admin-roles";
import { adminSecurityConfig, redactSecret } from "./security";
import {
  adminConvexConfigured,
  getAdminDomainDetailFromConvex,
  listAdminDomainFromConvex,
  runAdminDomainActionInConvex,
} from "./admin-convex";

const platformActions: AdminAction[] = [
  { id: "pause", label: "Pause", tone: "neutral", requiresReason: true, roles: ["platform_admin"] },
  { id: "revoke", label: "Revoke", tone: "danger", requiresReason: true, roles: ["platform_admin"] },
  { id: "restore", label: "Restore", tone: "primary", requiresReason: true, roles: ["platform_admin"] },
];

const reviewActions: AdminAction[] = [
  { id: "approved", label: "Approve", tone: "primary", requiresReason: false, roles: ["platform_admin"] },
  { id: "rejected", label: "Reject with partner reply", tone: "danger", requiresReason: true, roles: ["platform_admin"] },
  { id: "suspended", label: "Suspend", tone: "danger", requiresReason: true, roles: ["platform_admin"] },
  { id: "request_changes", label: "Request changes", tone: "neutral", requiresReason: true, roles: ["platform_admin"] },
  { id: "reply", label: "Reply to partner", tone: "neutral", requiresReason: true, roles: ["platform_admin"] },
  { id: "internal_note", label: "Add internal note", tone: "neutral", requiresReason: true, roles: ["platform_admin"] },
];

function row(domain: AdminDomainId, id: string, title: string, subtitle: string, status: AdminRecordStatus, fields: AdminRecordSummary["fields"], updatedAt = Date.now()): AdminRecordSummary {
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
      { label: "Service token", value: redactSecret(process.env.ADMIN_CONVEX_SERVICE_TOKEN ?? process.env.WORKSPACE_ADMIN_SERVICE_TOKEN), secret: true },
      { label: "Browser exposure", value: "Never sent to client" },
    ]),
    row("security", "platform-admin-source", "Platform admin source", "Read-only operator-controlled env/DB", "active", [
      { label: "Configured admins", value: String(security.platformAdminEmails.length) },
      { label: "Promotion UI", value: "Disabled" },
    ]),
  ];
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

function filterLocalRows(rows: AdminRecordSummary[], search?: string) {
  const normalized = search?.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((record) => [record.title, record.subtitle, record.status, ...record.fields.map((field) => `${field.label} ${field.value}`)].join(" ").toLowerCase().includes(normalized));
}

function auditFor(record: AdminRecordSummary, actor = "system"): AdminAuditEvent[] {
  return [
    {
      id: createHash("sha256").update(`${record.id}:inspect`).digest("hex").slice(0, 12),
      actor,
      action: "admin.record.inspect",
      summary: `Viewed ${record.title}.`,
      createdAt: Date.now(),
    },
  ];
}

function actionsForDomain(domain: AdminDomainId) {
  if (domain === "apps" || domain === "oauth-clients") return reviewActions;
  if (["partner-connections", "api-keys", "mcp-connections", "webhooks"].includes(domain)) return platformActions;
  return [];
}

function actionsForIdentity(actions: AdminAction[], roles: AdminRole[]) {
  return actions.map((action) => ({
    ...action,
    label: action.roles.some((role) => roles.includes(role)) ? action.label : `${action.label} (read only)`,
  }));
}

export async function listAdminDomain(domain: AdminDomainId, request: AdminListRequest = {}): Promise<AdminListResponse> {
  if (domain === "security") {
    const rows = filterLocalRows(securityRows(), request.search);
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
  }

  if (!adminConvexConfigured()) {
    return unavailableList(domain, "Admin Convex real-data adapter is not configured. Set CONVEX_URL and ADMIN_CONVEX_SERVICE_TOKEN or WORKSPACE_ADMIN_SERVICE_TOKEN.");
  }

  try {
    return await listAdminDomainFromConvex(domain, request);
  } catch (error) {
    return unavailableList(domain, error instanceof Error ? error.message : "Admin Convex real-data adapter failed.");
  }
}

export async function getAdminDomainDetail(domain: AdminDomainId, id: string, identity?: AdminIdentity): Promise<AdminDetailResponse | null> {
  if (domain === "security") {
    const record = securityRows().find((candidate) => candidate.id === id);
    if (!record) return null;
    return {
      domain,
      record,
      related: securityRows().filter((candidate) => candidate.id !== id),
      sections: [],
      notifications: [],
      auditTimeline: auditFor(record, identity?.email),
      availableActions: [],
    };
  }

  if (!adminConvexConfigured()) return null;
  const detail = await getAdminDomainDetailFromConvex(domain, id, identity);
  if (!detail) return null;
  return {
    ...detail,
    sections: detail.sections ?? [],
    notifications: detail.notifications ?? [],
    availableActions: actionsForIdentity(actionsForDomain(domain), identity?.roles ?? []),
  };
}

export async function runAdminDomainAction(domain: AdminDomainId, request: AdminActionRequest, identity: AdminIdentity): Promise<AdminActionResponse> {
  if (!canMutateAdminResources(identity.roles)) throw new Error("Platform admin role required for mutations.");
  const action = actionsForDomain(domain).find((candidate) => candidate.id === request.actionId);
  if (!action) throw new Error("This domain is read-only until a reversible Workspace control exists.");
  if (action.requiresReason && !request.reason?.trim()) throw new Error("A reason is required for this action.");
  if (!adminConvexConfigured()) throw new Error("Admin Convex real-data adapter is not configured.");

  try {
    return await runAdminDomainActionInConvex(domain, request, identity);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Admin action failed.");
  }
}

export function createLocalAuditId() {
  return randomUUID();
}
