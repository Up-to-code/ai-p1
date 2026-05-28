import { randomUUID } from "node:crypto";
import type {
  AdminAction,
  AdminActionRequest,
  AdminActionResponse,
  AdminDetailResponse,
  AdminDomainId,
  AdminListRequest,
  AdminListResponse,
} from "./admin-contracts";
import type { AdminIdentity } from "./admin-auth";
import { canMutateAdminResources, type AdminRole } from "./admin-roles";
import { adminSourceForDomain } from "./admin-domain-sources";

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
  return adminSourceForDomain(domain).list(domain, request);
}

export async function getAdminDomainDetail(domain: AdminDomainId, id: string, identity?: AdminIdentity): Promise<AdminDetailResponse | null> {
  const detail = await adminSourceForDomain(domain).detail(domain, id, identity);
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

  try {
    const source = adminSourceForDomain(domain);
    if (!source.action) throw new Error("This domain is read-only until a reversible Workspace control exists.");
    return await source.action(domain, request, identity);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Admin action failed.");
  }
}

export function createLocalAuditId() {
  return randomUUID();
}
