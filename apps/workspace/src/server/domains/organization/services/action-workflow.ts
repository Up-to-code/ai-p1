import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";
import { OrganizationActionError } from "../errors/action-error";
import type {
  OrganizationInvitationForPolicy,
  OrganizationMemberForPolicy,
  OrganizationRoleForPolicy,
} from "./access-policy";
import { callClerkOrganization } from "./clerk-organization-proxy";

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
  await fetchAuthMutation(api.organizations.audit.write.recordFromHono, {
    organizationId,
    input,
  });
}

export async function requireOrganizationAction(
  organizationId: string,
  resource: OrganizationActionPermission["resource"],
  action: string,
) {
  try {
    await assertCanUseOrganizationResource(organizationId, resource, action);
  } catch (error) {
    const message = error instanceof Error ? error.message : "You are not allowed to perform this organization action.";
    throw new OrganizationActionError(message, 403);
  }
}

function unwrapMembers(data: MemberListResponse) {
  return Array.isArray(data) ? data : data.members ?? [];
}

export async function listMembersForOrganizationAction(c: Context, organizationId: string) {
  const data = await callClerkOrganization<MemberListResponse>(c, "/organization/list-members", {
    query: { organizationId, limit: 100, offset: 0 },
    fallback: "Members could not be loaded.",
  });

  return unwrapMembers(data);
}

export async function listInvitationsForOrganizationAction(c: Context, organizationId: string) {
  return callClerkOrganization<InvitationListResponse>(c, "/organization/list-invitations", {
    query: { organizationId },
    fallback: "Invitations could not be loaded.",
  });
}

export async function listRolesForOrganizationAction(c: Context, organizationId: string) {
  return callClerkOrganization<RoleListResponse>(c, "/organization/list-roles", {
    query: { organizationId },
    fallback: "Work roles could not be loaded.",
  });
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
