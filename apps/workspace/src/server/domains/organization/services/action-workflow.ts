import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { logger } from "@/lib/logger";
import { fetchAuthMutation } from "@/server/auth/convex-auth";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";
import { OrganizationActionError } from "../errors/action-error";
import type {
  OrganizationInvitationForPolicy,
  OrganizationMemberForPolicy,
  OrganizationRoleForPolicy,
} from "./access-policy";
import {
  getCurrentBetterAuthOrganizationRole,
  listInvitationsBA,
  listOrganizationMembersBA,
  listOrganizationRolesBA,
} from "./better-auth-organization-service";

type MemberListResponse = { members?: OrganizationMemberForPolicy[] } | OrganizationMemberForPolicy[];
type InvitationListResponse = OrganizationInvitationForPolicy[];
type RoleListResponse = OrganizationRoleForPolicy[];

type OrganizationActionPermission = {
  resource: Parameters<typeof assertCanUseOrganizationResource>[1];
  action: string;
};

type OrganizationAuditInput<T> = {
  action: string;
  target: string;
  summary: string | ((result: T) => string);
};

export async function recordOrganizationAction(
  organizationId: string,
  input: { action: string; target: string; summary: string },
) {
  try {
    await fetchAuthMutation(api.organizations.audit.write.recordFromHono, {
      organizationId,
      input,
    });
  } catch (error) {
    logger.warn("Organization audit record skipped", {
      module: "organization-action-workflow",
      organizationId,
      action: input.action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function requireOrganizationAction(
  organizationId: string,
  resource: OrganizationActionPermission["resource"],
  action: string,
) {
  try {
    await assertCanUseOrganizationResource(organizationId, resource, action);
  } catch (error) {
    if (await canUseBetterAuthOrganizationResource(organizationId, resource, action)) return;

    const message = error instanceof Error ? error.message : "You are not allowed to perform this organization action.";
    throw new OrganizationActionError(message, 403);
  }
}

async function canUseBetterAuthOrganizationResource(
  organizationId: string,
  resource: OrganizationActionPermission["resource"],
  action: string,
) {
  const role = await getCurrentBetterAuthOrganizationRole(organizationId);
  if (!role) return false;

  const roles = new Set(role.split(",").map((item) => item.trim()).filter(Boolean));
  const isOwner = roles.has("owner");
  const isAdmin = roles.has("admin");
  const isMember = roles.has("member");
  const hasOrgAccess = isOwner || isAdmin || isMember;

  if (action === "read") {
    if (resource === "role") return isOwner || isAdmin;
    return hasOrgAccess;
  }

  if (resource === "organization") return isOwner || isAdmin;
  if (resource === "member") return isOwner || isAdmin;
  if (resource === "role") return isOwner;

  return isOwner || isAdmin;
}

function unwrapMembers(data: MemberListResponse) {
  return Array.isArray(data) ? data : data.members ?? [];
}

export async function listMembersForOrganizationAction(c: Context, organizationId: string) {
  const data: MemberListResponse = await listOrganizationMembersBA(c, organizationId);

  return unwrapMembers(data);
}

export async function listInvitationsForOrganizationAction(c: Context, organizationId: string) {
  return listInvitationsBA(c, organizationId) as Promise<InvitationListResponse>;
}

export async function listRolesForOrganizationAction(c: Context, organizationId: string) {
  return listOrganizationRolesBA(c, organizationId) as Promise<RoleListResponse>;
}

export async function runOrganizationActionWorkflow<T>(
  organizationId: string,
  options: {
    permission: OrganizationActionPermission;
    prepare?: () => Promise<void>;
    perform: () => Promise<T>;
    audit: OrganizationAuditInput<T>;
  },
) {
  await requireOrganizationAction(organizationId, options.permission.resource, options.permission.action);
  await options.prepare?.();
  const result = await options.perform();
  await recordOrganizationAction(organizationId, {
    action: options.audit.action,
    target: options.audit.target,
    summary: typeof options.audit.summary === "function" ? options.audit.summary(result) : options.audit.summary,
  });
  return result;
}
