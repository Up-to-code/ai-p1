import { organizationPermissionStatement, type OrganizationPermissionStatement } from "@/packages/authz";
import { OrganizationActionError } from "./action-workflow";

const defaultOrganizationRoles = ["owner", "admin", "member"] as const;
type DefaultOrganizationRole = (typeof defaultOrganizationRoles)[number];

export type OrganizationMemberForPolicy = {
  id: string;
  userId: string;
  role: string;
  user?: { email?: string | null };
};

export type OrganizationInvitationForPolicy = {
  role: string;
  status?: string;
};

export type OrganizationRoleForPolicy = {
  id: string;
  role: string;
};

function isDefaultOrganizationRole(role: string) {
  return defaultOrganizationRoles.includes(role as DefaultOrganizationRole);
}

function parseRoleList(role: string) {
  return role
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasOwnerRole(role: string) {
  return parseRoleList(role).includes("owner");
}

export function normalizeOrganizationRoleName(role: string) {
  return role
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validatePermissionPayload(
  permission: Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
) {
  const nextPermission: Partial<Record<keyof OrganizationPermissionStatement, string[]>> = {};

  for (const [resource, actions] of Object.entries(permission)) {
    if (!(resource in organizationPermissionStatement)) {
      throw new OrganizationActionError(`Unknown work area: ${resource}.`, 400);
    }

    const allowedActions = organizationPermissionStatement[
      resource as keyof OrganizationPermissionStatement
    ] as readonly string[];
    const uniqueActions = Array.from(new Set(actions ?? []));

    for (const action of uniqueActions) {
      if (!allowedActions.includes(action)) {
        throw new OrganizationActionError(`Unknown allowed work: ${resource}:${action}.`, 400);
      }
    }

    if (uniqueActions.length > 0) {
      nextPermission[resource as keyof OrganizationPermissionStatement] = uniqueActions;
    }
  }

  return nextPermission;
}

export function assertRoleNameIsCustom(role: string) {
  if (isDefaultOrganizationRole(role)) {
    throw new OrganizationActionError("Built-in work roles cannot be changed.", 400);
  }
}

export function assertAssignableRole(role: string, roles: OrganizationRoleForPolicy[]) {
  if (isDefaultOrganizationRole(role)) return;
  if (!roles.some((item) => item.role === role)) {
    throw new OrganizationActionError("This work role does not exist.", 400);
  }
}

function ownerMemberCount(members: OrganizationMemberForPolicy[]) {
  return members.filter((member) => hasOwnerRole(member.role)).length;
}

export function assertOrganizationRetainsOwnerAfterMemberChange(
  input: { currentRole: string; nextRole?: string; members: OrganizationMemberForPolicy[] },
) {
  if (
    hasOwnerRole(input.currentRole) &&
    (!input.nextRole || !hasOwnerRole(input.nextRole)) &&
    ownerMemberCount(input.members) <= 1
  ) {
    throw new OrganizationActionError("The organization must keep at least one owner.", 400);
  }
}

export function assertCanRemoveMember(
  input: { currentUserId: string; targetMemberIdOrEmail: string; members: OrganizationMemberForPolicy[] },
) {
  const target = input.members.find(
    (member) =>
      member.id === input.targetMemberIdOrEmail ||
      member.userId === input.targetMemberIdOrEmail ||
      member.user?.email === input.targetMemberIdOrEmail,
  );

  if (!target) {
    throw new OrganizationActionError("Member was not found.", 404);
  }

  if (target.userId === input.currentUserId) {
    throw new OrganizationActionError("You cannot remove yourself from the organization.", 400);
  }

  assertOrganizationRetainsOwnerAfterMemberChange({ currentRole: target.role, members: input.members });
}

export function assertCanChangeMemberRole(
  input: { targetMemberId: string; nextRole: string; members: OrganizationMemberForPolicy[]; roles: OrganizationRoleForPolicy[] },
) {
  assertAssignableRole(input.nextRole, input.roles);

  const target = input.members.find((member) => member.id === input.targetMemberId);
  if (!target) {
    throw new OrganizationActionError("Member was not found.", 404);
  }

  assertOrganizationRetainsOwnerAfterMemberChange({
    currentRole: target.role,
    nextRole: input.nextRole,
    members: input.members,
  });
}

export function assertCanDeleteRole(
  input: { role: OrganizationRoleForPolicy; members: OrganizationMemberForPolicy[]; invitations: OrganizationInvitationForPolicy[]; pendingInviteLinkCount: number },
) {
  assertRoleNameIsCustom(input.role.role);

  if (input.members.some((member) => parseRoleList(member.role).includes(input.role.role))) {
    throw new OrganizationActionError("This work role is still used by team members.", 400);
  }

  if (
    input.invitations.some(
      (invitation) => invitation.status !== "canceled" && parseRoleList(invitation.role).includes(input.role.role),
    )
  ) {
    throw new OrganizationActionError("This work role is still used by pending invitations.", 400);
  }

  if (input.pendingInviteLinkCount > 0) {
    throw new OrganizationActionError("This work role is still used by pending invite links.", 400);
  }
}
