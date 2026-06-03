import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { OrganizationPermissionStatement } from "@/packages/authz";
import { organizationPermissionStatement } from "@/packages/authz";
import { fetchAuthMutation } from "@/server/auth/convex-workos/server";
import { getWorkOSClient } from "@/server/auth/workos/client";
import { resolveWorkOSSessionFromHeaders, type WorkOSResolvedSession } from "@/server/auth/workos/session";
import { OrganizationActionError } from "../errors/action-error";
import type {
  OrganizationInvitationForPolicy,
  OrganizationMemberForPolicy,
  OrganizationRoleForPolicy,
} from "./access-policy";

type PermissionPayload = Partial<Record<keyof OrganizationPermissionStatement, string[]>>;

type WorkOSRole = {
  id: string;
  slug: string;
  name: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
};

type WorkOSMembership = {
  id: string;
  organizationId: string;
  userId: string;
  status: string;
  role?: { slug?: string } | null;
  roles?: Array<{ slug?: string }>;
  createdAt?: string;
  updatedAt?: string;
};

type WorkOSUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
};

type WorkOSInvitation = {
  id: string;
  organizationId?: string | null;
  email: string;
  state?: string;
  roleSlug?: string | null;
  inviterUserId?: string | null;
  expiresAt?: string;
  createdAt?: string;
};

export type WorkOSOrganizationSession = WorkOSResolvedSession & {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
};

function errorStatus(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: unknown }).status)
    : undefined;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function roleSlugs(membership: WorkOSMembership) {
  const roles = (membership.roles ?? [])
    .map((role) => role.slug)
    .filter((role): role is string => Boolean(role));
  const primary = membership.role?.slug;
  return Array.from(new Set([primary, ...roles].filter((role): role is string => Boolean(role))));
}

function permissionPayloadToSlugs(permission: PermissionPayload) {
  return Object.entries(permission).flatMap(([resource, actions]) =>
    (actions ?? []).map((action) => `${resource}:${action}`),
  );
}

function permissionSlugsToPayload(permissions: string[] = []) {
  const payload: PermissionPayload = {};
  for (const permission of permissions) {
    const [resource, action] = permission.split(":");
    if (!resource || !action || !(resource in organizationPermissionStatement)) continue;
    const key = resource as keyof OrganizationPermissionStatement;
    const allowed = organizationPermissionStatement[key] as readonly string[];
    if (!allowed.includes(action)) continue;
    payload[key] = Array.from(new Set([...(payload[key] ?? []), action]));
  }
  return payload;
}

function toMember(membership: WorkOSMembership, user?: WorkOSUser): OrganizationMemberForPolicy & {
  organizationId: string;
  createdAt: string;
} {
  const roles = roleSlugs(membership);
  return {
    id: membership.id,
    organizationId: membership.organizationId,
    userId: membership.userId,
    role: roles.join(",") || "member",
    createdAt: membership.createdAt ?? new Date().toISOString(),
    user: user
      ? {
        email: user.email,
      }
      : undefined,
  };
}

function toInvitation(invitation: WorkOSInvitation): OrganizationInvitationForPolicy & {
  id: string;
  organizationId: string;
  email: string;
  inviterId: string;
  expiresAt: string;
  createdAt: string;
} {
  return {
    id: invitation.id,
    organizationId: invitation.organizationId ?? "",
    email: invitation.email,
    role: invitation.roleSlug ?? "member",
    status: invitation.state ?? "pending",
    inviterId: invitation.inviterUserId ?? "",
    expiresAt: invitation.expiresAt ?? new Date().toISOString(),
    createdAt: invitation.createdAt ?? new Date().toISOString(),
  };
}

function toRole(organizationId: string, role: WorkOSRole): OrganizationRoleForPolicy & {
  organizationId: string;
  permission: PermissionPayload;
  createdAt: string;
  updatedAt?: string;
} {
  return {
    id: role.slug,
    organizationId,
    role: role.slug,
    permission: permissionSlugsToPayload(role.permissions ?? []),
    createdAt: role.createdAt ?? role.created_at ?? new Date().toISOString(),
    updatedAt: role.updatedAt ?? role.updated_at,
  };
}

async function workosOrganizationId(organizationId: string) {
  const organization = await fetchAuthMutation(api.workosAuth.ensureOrganizationForWorkOSActions, {
    organizationId,
  });
  return organization.workosOrganizationId;
}

async function rolePermissions(workosOrganizationId: string, roleSlug: string) {
  const role = await getWorkOSClient().authorization.getOrganizationRole(workosOrganizationId, roleSlug);
  return (role as WorkOSRole).permissions ?? [];
}

async function projectMembership(organizationId: string, workosOrganizationId: string, membership: WorkOSMembership) {
  const roles = roleSlugs(membership);
  const primaryRole = roles[0] ?? "member";
  const permissions = await rolePermissions(workosOrganizationId, primaryRole).catch(() => []);
  await fetchAuthMutation(api.workosAuth.upsertMembershipProjection, {
    organizationId,
    workosOrganizationId,
    workosUserId: membership.userId,
    workosMembershipId: membership.id,
    userId: membership.userId,
    role: primaryRole,
    roles,
    permissions,
    status: membership.status === "inactive" || membership.status === "pending" ? membership.status : "active",
  });
}

export async function getWorkOSOrganizationSession(c: Context): Promise<WorkOSOrganizationSession> {
  try {
    const session = await resolveWorkOSSessionFromHeaders(new Headers(c.req.raw.headers));
    return {
      ...session,
      user: {
        id: session.workosUserId,
        email: undefined,
        name: undefined,
      },
    };
  } catch (error) {
    throw new OrganizationActionError(errorMessage(error, "You must be signed in."), 401);
  }
}

export async function updateWorkOSOrganizationIdentity(
  organizationId: string,
  input: { name?: string; logo?: string; metadata?: Record<string, unknown> },
) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const metadata = Object.fromEntries(
    Object.entries({
      ...(input.metadata ?? {}),
      logo: input.logo,
    }).filter(([, value]) => typeof value === "string"),
  ) as Record<string, string>;

  const organization = await getWorkOSClient().organizations.updateOrganization({
    organization: workosOrgId,
    name: input.name,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });

  await fetchAuthMutation(api.workosAuth.updateOrganizationSettingsProjection, {
    organizationId,
    name: input.name,
  });

  return {
    id: organization.id,
    organizationId,
    name: organization.name,
    metadata: organization.metadata,
  };
}

export async function listWorkOSOrganizationMembers(organizationId: string) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const [memberships, users] = await Promise.all([
    getWorkOSClient().userManagement.listOrganizationMemberships({
      organizationId: workosOrgId,
      limit: 100,
    }),
    getWorkOSClient().userManagement.listUsers({ organizationId: workosOrgId, limit: 100 }),
  ]);
  const usersById = new Map((users.data as WorkOSUser[]).map((user) => [user.id, user]));
  return (memberships.data as WorkOSMembership[]).map((membership) => toMember(membership, usersById.get(membership.userId)));
}

export async function listWorkOSOrganizationInvitations(organizationId: string) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const invitations = await getWorkOSClient().userManagement.listInvitations({
    organizationId: workosOrgId,
    limit: 100,
  });
  return (invitations.data as WorkOSInvitation[]).map(toInvitation);
}

export async function listWorkOSOrganizationRoles(organizationId: string) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const roles = await getWorkOSClient().authorization.listOrganizationRoles(workosOrgId);
  return (roles.data as WorkOSRole[]).map((role) => toRole(organizationId, role));
}

export async function createWorkOSOrganizationInvitation(
  organizationId: string,
  input: { email: string; role: string },
  inviterUserId?: string,
) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const invitation = await getWorkOSClient().userManagement.sendInvitation({
    email: input.email,
    organizationId: workosOrgId,
    inviterUserId,
    roleSlug: input.role,
  });
  return toInvitation(invitation as WorkOSInvitation);
}

export async function cancelWorkOSOrganizationInvitation(invitationId: string) {
  const invitation = await getWorkOSClient().userManagement.revokeInvitation(invitationId);
  return toInvitation(invitation as WorkOSInvitation);
}

export async function updateWorkOSOrganizationMemberRole(
  organizationId: string,
  memberId: string,
  role: string,
) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const membership = await getWorkOSClient().userManagement.updateOrganizationMembership(memberId, {
    roleSlug: role,
  });
  await projectMembership(organizationId, workosOrgId, membership as WorkOSMembership);
  const users = await getWorkOSClient().userManagement.listUsers({
    organizationId: workosOrgId,
    limit: 100,
  });
  const user = (users.data as WorkOSUser[]).find((item) => item.id === (membership as WorkOSMembership).userId);
  return toMember(membership as WorkOSMembership, user);
}

export async function removeWorkOSOrganizationMember(organizationId: string, memberIdOrEmail: string) {
  const members = await listWorkOSOrganizationMembers(organizationId);
  const member = members.find(
    (item) =>
      item.id === memberIdOrEmail ||
      item.userId === memberIdOrEmail ||
      item.user?.email === memberIdOrEmail,
  );
  if (!member) throw new OrganizationActionError("Member was not found.", 404);

  await getWorkOSClient().userManagement.deleteOrganizationMembership(member.id);
  await fetchAuthMutation(api.workosAuth.markMembershipProjectionDeleted, {
    workosMembershipId: member.id,
  });
  return member;
}

async function ensureWorkOSPermissions(permissionSlugs: string[]) {
  await Promise.all(permissionSlugs.map(async (slug) => {
    try {
      await getWorkOSClient().authorization.createPermission({
        slug,
        name: slug,
        description: `Qentrah workspace permission ${slug}`,
      });
    } catch (error) {
      if (errorStatus(error) !== 409) throw error;
    }
  }));
}

export async function createWorkOSOrganizationRole(
  organizationId: string,
  role: string,
  permission: PermissionPayload,
) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const permissionSlugs = permissionPayloadToSlugs(permission);
  await ensureWorkOSPermissions(permissionSlugs);
  const created = await getWorkOSClient().authorization.createOrganizationRole(workosOrgId, {
    slug: role,
    name: role,
    description: `Qentrah workspace role ${role}`,
  });
  const updated = await getWorkOSClient().authorization.setOrganizationRolePermissions(workosOrgId, role, {
    permissions: permissionSlugs,
  });
  return toRole(organizationId, (updated ?? created) as WorkOSRole);
}

export async function updateWorkOSOrganizationRole(
  organizationId: string,
  currentRole: string,
  input: { roleName?: string; permission?: PermissionPayload },
) {
  const workosOrgId = await workosOrganizationId(organizationId);
  const nextRole = input.roleName ?? currentRole;
  let role: WorkOSRole = await getWorkOSClient().authorization.updateOrganizationRole(workosOrgId, currentRole, {
    name: nextRole,
  }) as WorkOSRole;
  if (input.permission) {
    const permissionSlugs = permissionPayloadToSlugs(input.permission);
    await ensureWorkOSPermissions(permissionSlugs);
    role = await getWorkOSClient().authorization.setOrganizationRolePermissions(workosOrgId, nextRole, {
      permissions: permissionSlugs,
    }) as WorkOSRole;
  }
  return toRole(organizationId, role);
}

export async function deleteWorkOSOrganizationRole(organizationId: string, role: string) {
  const workosOrgId = await workosOrganizationId(organizationId);
  await getWorkOSClient().authorization.deleteOrganizationRole(workosOrgId, role);
  return { id: role, organizationId, role };
}

export async function acceptWorkOSOrganizationInvitation(c: Context, invitationId: string) {
  const accepted = await getWorkOSClient().userManagement.acceptInvitation(invitationId);
  const invitation = accepted as WorkOSInvitation & { acceptedUserId?: string | null };
  if (invitation.organizationId && invitation.acceptedUserId) {
    const localOrganization = await fetchAuthMutation(api.workosAuth.ensureLocalOrganizationForWorkOSActions, {
      workosOrganizationId: invitation.organizationId,
    });
    const memberships = await getWorkOSClient().userManagement.listOrganizationMemberships({
      organizationId: invitation.organizationId,
      userId: invitation.acceptedUserId,
      limit: 1,
    });
    const membership = (memberships.data as WorkOSMembership[])[0];
    if (membership) {
      await projectMembership(localOrganization.organizationId, invitation.organizationId, membership);
    }
  }
  const session = await getWorkOSOrganizationSession(c).catch(() => null);
  return {
    organizationId: session?.organizationId,
    invitation: toInvitation(invitation),
  };
}
