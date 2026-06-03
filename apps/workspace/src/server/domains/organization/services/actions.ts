import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/convex-workos/server";
import { getOrganizationCapabilities } from "@/server/utils/organization/access-checker";
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
} from "./access-policy";
import {
  acceptWorkOSOrganizationInvitation,
  cancelWorkOSOrganizationInvitation,
  createWorkOSOrganizationInvitation,
  createWorkOSOrganizationRole,
  deleteWorkOSOrganizationRole,
  getWorkOSOrganizationSession,
  removeWorkOSOrganizationMember,
  updateWorkOSOrganizationIdentity,
  updateWorkOSOrganizationMemberRole,
  updateWorkOSOrganizationRole,
} from "./workos-organization-adapter";
import {
  listInvitationsForOrganizationAction,
  listMembersForOrganizationAction,
  listRolesForOrganizationAction,
  recordOrganizationAction,
  requireOrganizationAction,
  runOrganizationActionWorkflow,
} from "./action-workflow";
import type {
  CreateOrganizationInvitationInput,
  CreateOrganizationRoleInput,
  OrganizationIdentityUpdateInput,
  UpdateOrganizationMemberRoleInput,
  UpdateOrganizationRoleInput,
} from "../validation/actions.schema";

const listMembers = listMembersForOrganizationAction;
const listInvitations = listInvitationsForOrganizationAction;
const listRoles = listRolesForOrganizationAction;

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
  return runOrganizationActionWorkflow(organizationId, {
    permission: { resource: "organization", action: "update" },
    perform: () => updateWorkOSOrganizationIdentity(organizationId, input),
    audit: {
      action: "organization.identity.update",
      target: organizationId,
      summary: input.logo
        ? "Updated organization logo."
        : `Updated organization identity${input.name ? ` to ${input.name}` : ""}.`,
    },
  });
}

export async function createOrganizationEmailInvitation(
  c: Context,
  organizationId: string,
  input: CreateOrganizationInvitationInput,
) {
  return runOrganizationActionWorkflow(organizationId, {
    permission: { resource: "member", action: "create" },
    prepare: () => assertCanAssignRole(c, organizationId, input.role),
    perform: async () => {
      const session = await getWorkOSOrganizationSession(c);
      return createWorkOSOrganizationInvitation(organizationId, input, session.workosUserId);
    },
    audit: {
      action: "organization.invitation.create",
      target: input.email,
      summary: `Invited ${input.email} as ${input.role}.`,
    },
  });
}

export async function cancelOrganizationEmailInvitation(
  c: Context,
  organizationId: string,
  invitationId: string,
) {
  return runOrganizationActionWorkflow(organizationId, {
    permission: { resource: "member", action: "create" },
    perform: () => cancelWorkOSOrganizationInvitation(invitationId),
    audit: {
      action: "organization.invitation.cancel",
      target: invitationId,
      summary: "Canceled email invitation.",
    },
  });
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

  const member = await updateWorkOSOrganizationMemberRole(organizationId, memberId, input.role);

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
  const session = await getWorkOSOrganizationSession(c);
  await requireOrganizationAction(organizationId, "member", "delete");
  const members = await listMembers(c, organizationId);

  assertCanRemoveMember({
    currentUserId: session.workosUserId,
    targetMemberIdOrEmail: memberIdOrEmail,
    members,
  });

  const member = await removeWorkOSOrganizationMember(organizationId, memberIdOrEmail);

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

  const created = await createWorkOSOrganizationRole(
    organizationId,
    role,
    validatePermissionPayload(
      input.permission as Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
    ),
  );

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

  const updated = await updateWorkOSOrganizationRole(organizationId, currentRole.role, {
    roleName: nextRoleName,
    permission: input.permission
      ? validatePermissionPayload(
        input.permission as Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
      )
      : undefined,
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

  const deleted = await deleteWorkOSOrganizationRole(organizationId, role.role);

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
  const accepted = await acceptWorkOSOrganizationInvitation(c, invitationId) as AcceptInvitationResponse;
  const organizationId =
    accepted.organizationId ??
    accepted.invitation?.organizationId ??
    accepted.member?.organizationId ??
    (await getWorkOSOrganizationSession(c).catch(() => null))?.organizationId;

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
