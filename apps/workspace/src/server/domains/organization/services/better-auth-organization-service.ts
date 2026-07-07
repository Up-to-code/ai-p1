/**
 * Better Auth Organization Service
 *
 * Replaces previous organization provider module.ts. Calls Better Auth's own HTTP
 * organization API endpoints, forwarding the current session cookie from
 * the AsyncLocalStorage request context set up by organizationRequestSafetyMiddleware.
 *
 * Better Auth persists org data (members, invitations, roles) via the
 * convex-dev/better-auth adapter into the Convex backend.
 */
import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { logger } from "@/lib/logger";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-auth";
import {
  callBetterAuth,
  getAuthRequestSession,
  getSessionUserId,
  type AuthRequestSession,
} from "@/server/auth/auth-request";
import type {
  OrganizationMember,
  OrganizationInvitation,
  OrganizationRole,
} from "@/domains/organization/api/types";
import type {
  OrganizationMemberForPolicy,
  OrganizationInvitationForPolicy,
  OrganizationRoleForPolicy,
} from "./access-policy";

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

export type BetterAuthWorkspaceSession = {
  session?: {
    userId?: string;
    activeOrganizationId?: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
};

async function callBetterAuthOrg<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  return callBetterAuth(path, options);
}

// ---------------------------------------------------------------------------
// Get current session user
// ---------------------------------------------------------------------------

export async function getBetterAuthSession(_c: Context): Promise<BetterAuthWorkspaceSession> {
  return getAuthRequestSession() as Promise<AuthRequestSession>;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

interface BetterAuthMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt?: string | number;
  user?: { id: string; email: string; name: string; image?: string | null };
}

function normalizeMember(m: BetterAuthMember, organizationId: string): OrganizationMember {
  return {
    id: m.id,
    organizationId,
    userId: m.userId,
    role: m.role,
    createdAt: typeof m.createdAt === "number"
      ? new Date(m.createdAt).toISOString()
      : (m.createdAt ?? new Date().toISOString()),
    user: m.user
      ? {
          id: m.user.id,
          email: m.user.email,
          name: m.user.name,
          image: m.user.image ?? null,
        }
      : {
          id: m.userId,
          email: "",
          name: "",
          image: null,
        },
  };
}

export async function listOrganizationMembersBA(
  _c: Context,
  organizationId: string,
): Promise<OrganizationMemberForPolicy[]> {
  const result = await callBetterAuthOrg<{ members?: BetterAuthMember[] } | BetterAuthMember[]>(
    "/organization/list-members",
    { method: "GET", query: { organizationId, limit: 100, offset: 0 } },
  );

  const members = Array.isArray(result) ? result : result.members ?? [];
  return members.map((m) => normalizeMember(m, organizationId));
}

export async function getCurrentBetterAuthOrganizationRole(
  organizationId: string,
): Promise<string | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const activeRole = await callBetterAuthOrg<{ role?: string }>(
    "/organization/get-active-member-role",
    { method: "GET", query: { organizationId } },
  ).catch(() => null);
  if (activeRole?.role) return activeRole.role;

  const result = await callBetterAuthOrg<{ members?: BetterAuthMember[] } | BetterAuthMember[]>(
    "/organization/list-members",
    { method: "GET", query: { organizationId, limit: 100, offset: 0 } },
  ).catch(() => null);

  const members = Array.isArray(result) ? result : result?.members ?? [];
  const member = members.find((item) => item.userId === userId);
  return member?.role ?? null;
}

export async function inviteMemberBA(
  _c: Context,
  organizationId: string,
  email: string,
  role: string,
): Promise<OrganizationInvitation> {
  return callBetterAuthOrg("/organization/invite-member", {
    body: { organizationId, email, role },
  });
}

export async function listInvitationsBA(
  _c: Context,
  organizationId: string,
): Promise<OrganizationInvitationForPolicy[]> {
  const result = await callBetterAuthOrg<
    { invitation: OrganizationInvitation } | OrganizationInvitation[]
  >("/organization/list-invitations", {
    method: "GET",
    query: { organizationId },
  });

  const items = Array.isArray(result) ? result : [];
  return items.map((inv) => ({ role: inv.role, status: inv.status }));
}

export async function cancelInvitationBA(
  _c: Context,
  invitationId: string,
): Promise<OrganizationInvitation> {
  return callBetterAuthOrg("/organization/cancel-invitation", {
    body: { invitationId },
  });
}

export async function acceptInvitationBA(
  _c: Context,
  invitationId: string,
): Promise<{ organizationId?: string; invitation?: { organizationId?: string; role?: string; email?: string }; member?: { organizationId?: string; role?: string } }> {
  return callBetterAuthOrg("/organization/accept-invitation", {
    body: { invitationId },
  });
}

// ---------------------------------------------------------------------------
// Members — update / remove
// ---------------------------------------------------------------------------

export async function updateMemberRoleBA(
  _c: Context,
  organizationId: string,
  memberId: string,
  role: string,
): Promise<OrganizationMember> {
  return callBetterAuthOrg("/organization/update-member-role", {
    body: { organizationId, memberId, role },
  });
}

export async function removeMemberBA(
  _c: Context,
  organizationId: string,
  memberIdOrEmail: string,
): Promise<OrganizationMember> {
  return callBetterAuthOrg("/organization/remove-member", {
    body: { organizationId, memberIdOrEmail },
  });
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

const BUILT_IN_ROLES: OrganizationRoleForPolicy[] = [
  { id: "owner", role: "owner" },
  { id: "admin", role: "admin" },
  { id: "member", role: "member" },
];

type StoredOrganizationRole = {
  id: string;
  organizationId: string;
  role: string;
  permission: Record<string, string[]>;
  createdAt: number;
  updatedAt: number;
};

function normalizeStoredRole(role: StoredOrganizationRole): OrganizationRole {
  return {
    ...role,
    createdAt: new Date(role.createdAt).toISOString(),
    updatedAt: new Date(role.updatedAt).toISOString(),
  } as OrganizationRole;
}

export async function listOrganizationRolesBA(
  _c: Context,
  organizationId: string,
): Promise<OrganizationRoleForPolicy[]> {
  const customRoles = await fetchAuthQuery(api.organizations.workRoles.list, { organizationId });
  return [...BUILT_IN_ROLES, ...customRoles];
}

export async function createOrganizationRoleBA(
  _c: Context,
  organizationId: string,
  role: string,
  permission: Record<string, string[]>,
): Promise<OrganizationRole> {
  const created = await fetchAuthMutation(api.organizations.workRoles.createFromHono, {
    organizationId,
    role,
    permission,
  });
  return normalizeStoredRole(created);
}

export async function updateOrganizationRoleBA(
  _c: Context,
  organizationId: string,
  roleId: string,
  data: { roleName?: string; permission?: Record<string, string[]> },
): Promise<OrganizationRole> {
  const updated = await fetchAuthMutation(api.organizations.workRoles.updateFromHono, {
    organizationId,
    roleId: roleId as Id<"organizationWorkRoles">,
    roleName: data.roleName,
    permission: data.permission,
  });
  return normalizeStoredRole(updated);
}

export async function deleteOrganizationRoleBA(
  _c: Context,
  organizationId: string,
  roleId: string,
): Promise<OrganizationRole> {
  const deleted = await fetchAuthMutation(api.organizations.workRoles.deleteFromHono, {
    organizationId,
    roleId: roleId as Id<"organizationWorkRoles">,
  });
  return normalizeStoredRole(deleted);
}

// ---------------------------------------------------------------------------
// Organization identity
// ---------------------------------------------------------------------------

export async function updateOrganizationIdentityBA(
  _c: Context,
  organizationId: string,
  data: { name?: string; logo?: string | null; website?: string; [k: string]: unknown },
): Promise<unknown> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.logo !== undefined) update.logo = data.logo;
  if (data.website !== undefined) update.website = data.website;

  return callBetterAuthOrg("/organization/update", {
    body: { organizationId, data: update },
  });
}

// ---------------------------------------------------------------------------
// Add member by user id (used by invite-link acceptance)
// ---------------------------------------------------------------------------

export async function addMemberToOrganizationBA(
  organizationId: string,
  userId: string,
  role: string,
): Promise<void> {
  await callBetterAuthOrg("/organization/add-member", {
    body: { organizationId, userId, role },
  }).catch((err) => {
    // Tolerate "already a member" errors
    if (!String(err).toLowerCase().includes("already")) throw err;
  });
}

// ---------------------------------------------------------------------------
// Get current user id from the Better Auth session
// ---------------------------------------------------------------------------

export async function getBetterAuthSessionUserId(): Promise<string | null> {
  return getSessionUserId();
}

// ---------------------------------------------------------------------------
// Provider-neutral organization command router used by action-workflow.ts and
// actions.ts while the Hono layer keeps path-shaped command dispatch.
// ---------------------------------------------------------------------------

export const callBetterAuthOrganization = async <T>(
  c: Context,
  path: string,
  input: {
    method?: "GET" | "POST" | "PATCH";
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    fallback: string;
  },
): Promise<T> => {
  const organizationId =
    String(input.query?.organizationId ?? (c.req.param("organizationId") ?? ""));

  const body = input.body as Record<string, unknown> | undefined;

  try {
    if (path.endsWith("/list-members")) {
      const data = await listOrganizationMembersBA(c, organizationId);
      return { members: data } as unknown as T;
    }

    if (path.endsWith("/list-invitations")) {
      const data = await listInvitationsBA(c, organizationId);
      return data as unknown as T;
    }

    if (path.endsWith("/list-roles")) {
      const data = await listOrganizationRolesBA(c, organizationId);
      return data as unknown as T;
    }

    if (path.endsWith("/update")) {
      return updateOrganizationIdentityBA(c, body?.organizationId as string ?? organizationId, body?.data as Record<string, unknown> ?? {}) as unknown as T;
    }

    if (path.endsWith("/invite-member")) {
      return inviteMemberBA(c, body?.organizationId as string ?? organizationId, body?.email as string, body?.role as string) as unknown as T;
    }

    if (path.endsWith("/cancel-invitation")) {
      return cancelInvitationBA(c, body?.invitationId as string) as unknown as T;
    }

    if (path.endsWith("/update-member-role")) {
      return updateMemberRoleBA(c, body?.organizationId as string ?? organizationId, body?.memberId as string, body?.role as string) as unknown as T;
    }

    if (path.endsWith("/remove-member")) {
      return removeMemberBA(c, body?.organizationId as string ?? organizationId, body?.memberIdOrEmail as string) as unknown as T;
    }

    if (path.endsWith("/create-role")) {
      return createOrganizationRoleBA(c, organizationId, body?.role as string, body?.permission as Record<string, string[]>) as unknown as T;
    }

    if (path.endsWith("/update-role")) {
      return updateOrganizationRoleBA(
        c,
        organizationId,
        body?.roleId as string,
        body?.data as { roleName?: string; permission?: Record<string, string[]> },
      ) as unknown as T;
    }

    if (path.endsWith("/delete-role")) {
      return deleteOrganizationRoleBA(c, organizationId, body?.roleId as string) as unknown as T;
    }

    if (path.endsWith("/accept-invitation")) {
      return acceptInvitationBA(c, body?.invitationId as string) as unknown as T;
    }

    logger.warn("Unknown Better Auth organization command path", {
      module: "better-auth-organization-service",
      path,
      organizationId,
    });
    return (input.body ?? { organizationId }) as unknown as T;
  } catch (error) {
    logger.error("Better Auth organization command failed", {
      module: "better-auth-organization-service",
      path,
      organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export type { OrganizationMember as BetterAuthOrganization };
