import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/better-auth/server";
import { assertCanUseOrganizationResource, getOrganizationCapabilities } from "@/server/utils/organization/access-checker";
import type { OrganizationPermissionStatement } from "@/packages/authz";
import { OrganizationActionError } from "../errors/action-error";
import {
  assertAssignableRole,
  assertCanChangeMemberRole,
  assertCanDeleteRole,
  assertCanRemoveMember,
  assertRoleNameIsCustom,
  normalizeOrganizationRoleName,
  validatePermissionPayload,
  type OrganizationInvitationForPolicy,
  type OrganizationMemberForPolicy,
  type OrganizationRoleForPolicy,
} from "./access-policy";
import { callBetterAuth, getBetterAuthSession } from "./better-auth-proxy";
import type {
  CreateOrganizationInvitationInput,
  CreateOrganizationRoleInput,
  OrganizationIdentityUpdateInput,
  UpdateOrganizationMemberRoleInput,
  UpdateOrganizationRoleInput,
} from "../validation/actions.schema";

type MemberListResponse = { members?: OrganizationMemberForPolicy[] } | OrganizationMemberForPolicy[];
type InvitationListResponse = OrganizationInvitationForPolicy[];
type RoleListResponse = OrganizationRoleForPolicy[];

async function recordOrganizationAction(
  organizationId: string,
  input: { action: string; target: string; summary: string },
) {
  await fetchAuthMutation(api.organizations.audit.write.recordFromHono, {
    organizationId,
    input,
  });
}

async function requireOrganizationAction(
  organizationId: string,
  resource: Parameters<typeof assertCanUseOrganizationResource>[1],
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

async function listMembers(c: Context, organizationId: string) {
  const data = await callBetterAuth<MemberListResponse>(c, "/organization/list-members", {
    query: { organizationId, limit: 100, offset: 0 },
    fallback: "Members could not be loaded.",
  });

  return unwrapMembers(data);
}

async function listInvitations(c: Context, organizationId: string) {
  return callBetterAuth<InvitationListResponse>(c, "/organization/list-invitations", {
    query: { organizationId },
    fallback: "Invitations could not be loaded.",
  });
}

async function listRoles(c: Context, organizationId: string) {
  return callBetterAuth<RoleListResponse>(c, "/organization/list-roles", {
    query: { organizationId },
    fallback: "Work roles could not be loaded.",
  });
}

export async function listOrganizationWorkRoles(c: Context, organizationId: string) {
  await requireOrganizationAction(organizationId, "role", "read");
  return listRoles(c, organizationId);
}

async function assertCanAssignRole(c: Context, organizationId: string, role: string) {
  const roles = await listRoles(c, organizationId);
  assertAssignableRole(role, roles);
}

export async function updateOrganizationIdentity(
  c: Context,
  organizationId: string,
  input: OrganizationIdentityUpdateInput,
) {
  await requireOrganizationAction(organizationId, "organization", "update");

  const organization = await callBetterAuth(c, "/organization/update", {
    body: { organizationId, data: input },
    fallback: "Organization could not be updated.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.identity.update",
    target: organizationId,
    summary: input.logo
      ? "Updated organization logo."
      : `Updated organization identity${input.name ? ` to ${input.name}` : ""}.`,
  });

  return organization;
}

export async function createOrganizationEmailInvitation(
  c: Context,
  organizationId: string,
  input: CreateOrganizationInvitationInput,
) {
  await requireOrganizationAction(organizationId, "member", "create");
  await assertCanAssignRole(c, organizationId, input.role);

  const invitation = await callBetterAuth(c, "/organization/invite-member", {
    body: { organizationId, email: input.email, role: input.role },
    fallback: "Invitation could not be created.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.invitation.create",
    target: input.email,
    summary: `Invited ${input.email} as ${input.role}.`,
  });

  return invitation;
}

export async function cancelOrganizationEmailInvitation(
  c: Context,
  organizationId: string,
  invitationId: string,
) {
  await requireOrganizationAction(organizationId, "member", "create");

  const invitation = await callBetterAuth(c, "/organization/cancel-invitation", {
    body: { invitationId },
    fallback: "Invitation could not be canceled.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.invitation.cancel",
    target: invitationId,
    summary: "Canceled email invitation.",
  });

  return invitation;
}

export async function updateOrganizationMemberRole(
  c: Context,
  organizationId: string,
  memberId: string,
  input: UpdateOrganizationMemberRoleInput,
) {
  await requireOrganizationAction(organizationId, "member", "update");
  const [members, roles] = await Promise.all([
    listMembers(c, organizationId),
    listRoles(c, organizationId),
  ]);

  assertCanChangeMemberRole({
    targetMemberId: memberId,
    nextRole: input.role,
    members,
    roles,
  });

  const member = await callBetterAuth(c, "/organization/update-member-role", {
    body: { organizationId, memberId, role: input.role },
    fallback: "Member role could not be updated.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.member.role.update",
    target: memberId,
    summary: `Changed member role to ${input.role}.`,
  });

  return member;
}

export async function removeOrganizationMember(
  c: Context,
  organizationId: string,
  memberIdOrEmail: string,
) {
  const session = await getBetterAuthSession(c);
  await requireOrganizationAction(organizationId, "member", "delete");
  const members = await listMembers(c, organizationId);

  assertCanRemoveMember({
    currentUserId: session.user?.id ?? "",
    targetMemberIdOrEmail: memberIdOrEmail,
    members,
  });

  const member = await callBetterAuth(c, "/organization/remove-member", {
    body: { organizationId, memberIdOrEmail },
    fallback: "Member could not be removed.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.member.remove",
    target: memberIdOrEmail,
    summary: "Removed organization member.",
  });

  return member;
}

export async function createOrganizationWorkRole(
  c: Context,
  organizationId: string,
  input: CreateOrganizationRoleInput,
) {
  await requireOrganizationAction(organizationId, "role", "create");
  const role = normalizeOrganizationRoleName(input.role);
  if (!role) {
    throw new OrganizationActionError("Work role name is required.", 400);
  }
  assertRoleNameIsCustom(role);

  const created = await callBetterAuth(c, "/organization/create-role", {
    body: {
      organizationId,
      role,
      permission: validatePermissionPayload(
        input.permission as Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
      ),
    },
    fallback: "Work role could not be created.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.role.create",
    target: role,
    summary: `Created work role ${role}.`,
  });

  return created;
}

export async function updateOrganizationWorkRole(
  c: Context,
  organizationId: string,
  roleId: string,
  input: UpdateOrganizationRoleInput,
) {
  await requireOrganizationAction(organizationId, "role", "update");
  const currentRole = (await listRoles(c, organizationId)).find((role) => role.id === roleId);
  if (!currentRole) {
    throw new OrganizationActionError("Work role was not found.", 404);
  }
  assertRoleNameIsCustom(currentRole.role);

  const nextRoleName = input.roleName ? normalizeOrganizationRoleName(input.roleName) : undefined;
  if (nextRoleName) {
    assertRoleNameIsCustom(nextRoleName);
  }

  const updated = await callBetterAuth(c, "/organization/update-role", {
    body: {
      organizationId,
      roleId,
      data: {
        roleName: nextRoleName,
        permission: input.permission
          ? validatePermissionPayload(
            input.permission as Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
          )
          : undefined,
      },
    },
    fallback: "Work role could not be updated.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.role.update",
    target: roleId,
    summary: `Updated work role ${nextRoleName ?? currentRole.role}.`,
  });

  return updated;
}

export async function deleteOrganizationWorkRole(
  c: Context,
  organizationId: string,
  roleId: string,
) {
  await requireOrganizationAction(organizationId, "role", "delete");
  const [members, invitations, roles] = await Promise.all([
    listMembers(c, organizationId),
    listInvitations(c, organizationId),
    listRoles(c, organizationId),
  ]);
  const role = roles.find((item) => item.id === roleId);
  if (!role) {
    throw new OrganizationActionError("Work role was not found.", 404);
  }
  const pendingInviteLinkCount = await fetchAuthQuery(
    api.organizations.inviteLinks.read.countPendingByRole,
    { organizationId, role: role.role },
  );

  assertCanDeleteRole({ role, members, invitations, pendingInviteLinkCount });

  const deleted = await callBetterAuth(c, "/organization/delete-role", {
    body: { organizationId, roleId },
    fallback: "Work role could not be deleted.",
  });

  await recordOrganizationAction(organizationId, {
    action: "organization.role.delete",
    target: roleId,
    summary: `Deleted work role ${role.role}.`,
  });

  return deleted;
}

type AcceptInvitationResponse = {
  organizationId?: string;
  invitation?: {
    organizationId?: string;
    role?: string;
    email?: string;
  };
  member?: {
    organizationId?: string;
    role?: string;
  };
};

export async function acceptOrganizationEmailInvitation(
  c: Context,
  invitationId: string,
) {
  const accepted = await callBetterAuth<AcceptInvitationResponse>(c, "/organization/accept-invitation", {
    body: { invitationId },
    fallback: "Invitation could not be accepted.",
  });
  const organizationId =
    accepted.organizationId ??
    accepted.invitation?.organizationId ??
    accepted.member?.organizationId ??
    (await getBetterAuthSession(c).catch(() => null))?.session?.activeOrganizationId;

  if (organizationId) {
    await recordOrganizationAction(organizationId, {
      action: "organization.invitation.accept",
      target: invitationId,
      summary: `Accepted email invitation${accepted.invitation?.role ? ` for ${accepted.invitation.role}` : ""}.`,
    });
  }

  return accepted;
}

export async function getCapabilities(organizationId: string) {
  return getOrganizationCapabilities(organizationId);
}
