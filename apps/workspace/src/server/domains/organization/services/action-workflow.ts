import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-workos/server";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";
import { OrganizationActionError } from "../errors/action-error";
import type {
  OrganizationInvitationForPolicy,
  OrganizationMemberForPolicy,
  OrganizationRoleForPolicy,
} from "./access-policy";
import {
  listWorkOSOrganizationInvitations,
  listWorkOSOrganizationMembers,
  listWorkOSOrganizationRoles,
} from "./workos-organization-adapter";

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
  void c;
  const data = await listWorkOSOrganizationMembers(organizationId);
  return unwrapMembers(data);
}

export async function listInvitationsForOrganizationAction(c: Context, organizationId: string) {
  void c;
  return listWorkOSOrganizationInvitations(organizationId) as Promise<InvitationListResponse>;
}

export async function listRolesForOrganizationAction(c: Context, organizationId: string) {
  void c;
  return listWorkOSOrganizationRoles(organizationId) as Promise<RoleListResponse>;
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
