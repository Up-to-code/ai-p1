import type { Context } from "hono";
import { getAuth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { authRequestStore } from "@/server/auth/clerk-convex";
import type {
  ClerkOrganization,
  OrganizationInvitation,
  OrganizationMember,
  OrganizationMembershipRole,
  Role,
  OrganizationMembership,
  DeletedObject,
} from "@clerk/types";

const clerkBackend = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export type ClerkWorkspaceSession = {
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

function organizationIdFromRequest(c: Context) {
  return c.req.param("organizationId") || "";
}

function stripOrgPrefix(role: string) {
  return role.replace(/^org:/, "");
}

function coerceRole(role: string): OrganizationMembershipRole {
  return (role.startsWith("org:") ? role : `org:${role}`) as OrganizationMembershipRole;
}

function makeName(member: { firstName?: string | null; lastName?: string | null; identifier?: string }): string {
  const first = member.firstName ?? "";
  const last = member.lastName ?? "";
  if (first || last) return `${first} ${last}`.trim();
  return member.identifier ?? "";
}

function getMembershipUserId(
  m: OrganizationMembership,
): string {
  // OrganizationMembership class only expose userId via raw JSON; fall back to identifier.
  type RawLike = {
    raw?: {
      public_user_data?: { user_id?: string };
    } | null;
  };
  return (
    (m as unknown as RawLike).raw?.public_user_data?.user_id ??
    m.publicUserData?.identifier ??
    ""
  );
}

function toOrgISOString(timestampMs: number) {
  return new Date(timestampMs).toISOString();
}

async function getRequestAuthSession() {
  const request = authRequestStore.getStore();
  if (request) {
    return getAuth(request as never, { acceptsToken: "session_token" });
  }
  throw new Error("Authentication context not available.");
}

export async function getClerkSession(c: Context): Promise<ClerkWorkspaceSession> {
  const session = await getRequestAuthSession();
  const organizationId = organizationIdFromRequest(c);
  const activeOrganizationId = session.orgId ?? organizationId;

  if (!session.userId) {
    throw new Error("Authentication required.");
  }

  return {
    session: {
      userId: session.userId,
      activeOrganizationId,
    },
    user: {
      id: session.userId,
      email: session.sessionClaims?.email as string ?? session.userId,
      name: (session.sessionClaims?.name as string) ?? session.userId,
      image: session.sessionClaims?.image_url as string ?? null,
    },
  };
}

interface InviteMemberInput {
  organizationId: string;
  email: string;
  role: string;
}

interface CancelInviteInput {
  invitationId: string;
}

interface UpdateMemberRoleInput {
  organizationId: string;
  memberId: string;
  role: string;
}

interface RemoveMemberInput {
  organizationId: string;
  memberIdOrEmail: string;
}

interface CreateRoleInput {
  organizationId: string;
  role: string;
  permission?: unknown;
}

interface UpdateRoleInput {
  organizationId: string;
  roleId: string;
  data: { roleName?: string | null; permission?: unknown };
}

interface DeleteRoleInput {
  organizationId: string;
  roleId: string;
}

interface UpdateOrgInput {
  organizationId?: string;
  data: { name?: string; logo?: string | null; website?: string; [k: string]: unknown };
}

function fromClerkMembership(
  m: OrganizationMembership,
  organizationId: string,
): OrganizationMember {
  const userId = getMembershipUserId(m);
  const identifier = m.publicUserData?.identifier ?? "";
  return {
    id: m.id,
    organizationId,
    userId,
    role: stripOrgPrefix(m.role),
    createdAt: toOrgISOString(m.createdAt),
    user: {
      id: userId,
      email: identifier,
      name: makeName({
        firstName: m.publicUserData?.firstName ?? null,
        lastName: m.publicUserData?.lastName ?? null,
        identifier,
      }),
      image: m.publicUserData?.hasImage ? m.publicUserData?.imageUrl : null,
    },
  };
}

function fromClerkInvitation(
  inv: OrganizationInvitation,
  fallbackOrgId: string,
): {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  inviterId: string;
  expiresAt: string;
  createdAt: string;
} {
  return {
    id: inv.id,
    organizationId: inv.organizationId ?? fallbackOrgId,
    email: inv.emailAddress,
    role: stripOrgPrefix(inv.role),
    status: inv.status ?? "pending",
    inviterId: "",
    expiresAt: toOrgISOString(inv.expiresAt),
    createdAt: toOrgISOString(inv.createdAt),
  };
}

function fromClerkRole(r: Role, organizationId: string) {
  return {
    id: r.id,
    organizationId,
    role: stripOrgPrefix(r.key),
    name: r.name,
    permission: {},
    createdAt: toOrgISOString(r.createdAt),
    updatedAt: toOrgISOString(r.updatedAt),
  };
}

export async function callClerkOrganization<T>(
  c: Context,
  path: string,
  input: {
    method?: "GET" | "POST" | "PATCH";
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    fallback: string;
  },
): Promise<T> {
  const organizationId = String(input.query?.organizationId ?? organizationIdFromRequest(c));

  try {
    if (path.endsWith("/list-members")) {
      const limit = Number(input.query?.limit ?? 100);
      const offset = Number(input.query?.offset ?? 0);
      const result = await clerkBackend.organizations.getOrganizationMembershipList({
        organizationId,
        limit,
        offset,
      });
      const members = result.data.map((m) => fromClerkMembership(m, organizationId));
      return { members } as unknown as T;
    }

    if (path.endsWith("/list-invitations")) {
      const result = await clerkBackend.organizations.getOrganizationInvitationList({
        organizationId,
        status: ["pending"],
      });
      return result.data.map((inv) => fromClerkInvitation(inv, organizationId)) as unknown as T;
    }

    if (path.endsWith("/list-roles")) {
      // getOrganizationRoleList is not available in @clerk/backend@3.10.0.
      // Return built-in roles only; custom roles require a newer Clerk version.
      const now = new Date().toISOString();
      const builtInRoles = [
        { id: "org:owner", organizationId, role: "owner", name: "Owner", permission: {}, createdAt: now, updatedAt: now },
        { id: "org:admin", organizationId, role: "admin", name: "Admin", permission: {}, createdAt: now, updatedAt: now },
        { id: "org:member", organizationId, role: "member", name: "Member", permission: {}, createdAt: now, updatedAt: now },
      ];
      return builtInRoles as unknown as T;
    }

    if (path.endsWith("/update")) {
      const body = (input.body ?? {}) as UpdateOrgInput;
      const data: Record<string, unknown> = {};
      if (body.data?.name !== undefined) data.name = body.data.name;
      if (body.data?.logo !== undefined) {
        data.publicMetadata = { logo: body.data.logo };
      }
      if (body.data?.website !== undefined) {
        data.publicMetadata = {
          ...(data.publicMetadata as Record<string, unknown> | undefined),
          website: body.data.website,
        };
      }
      const updated = await clerkBackend.organizations.updateOrganization(
        body.organizationId ?? organizationId,
        data,
      );
      return updated as unknown as T;
    }

    if (path.endsWith("/invite-member")) {
      const body = (input.body ?? {}) as InviteMemberInput;
      console.log("[clerk-org-proxy] invite-member:", {
        organizationId: body.organizationId,
        email: body.email,
        role: body.role,
        coercedRole: coerceRole(body.role),
      });
      const invitation = await clerkBackend.organizations.createOrganizationInvitation({
        organizationId: body.organizationId,
        emailAddress: body.email,
        role: coerceRole(body.role) as OrganizationMembershipRole,
        publicMetadata: {
          role: body.role,
        },
      });
      return invitation as unknown as T;
    }

    if (path.endsWith("/cancel-invitation")) {
      const body = (input.body ?? {}) as CancelInviteInput;
      const revoked = await clerkBackend.organizations.revokeOrganizationInvitation({
        organizationId,
        invitationId: body.invitationId,
      });
      return revoked as unknown as T;
    }

    if (path.endsWith("/update-member-role")) {
      const body = (input.body ?? {}) as UpdateMemberRoleInput;
      const updated = await clerkBackend.organizations.updateOrganizationMembership({
        organizationId: body.organizationId,
        userId: body.memberId,
        role: coerceRole(body.role) as OrganizationMembershipRole,
      });
      return updated as unknown as T;
    }

    if (path.endsWith("/remove-member")) {
      const body = (input.body ?? {}) as RemoveMemberInput;
      let userId = body.memberIdOrEmail;
      if (!userId.startsWith("user_") && userId.includes("@")) {
        const users = await clerkBackend.users.getUserList({
          emailAddress: [userId],
        });
        const match = users.data[0];
        if (!match) {
          throw new Error(input.fallback || "Member could not be found.");
        }
        userId = match.id;
      }
      const deleted: DeletedObject = await clerkBackend.organizations.deleteOrganizationMembership({
        organizationId: body.organizationId,
        userId,
      });
      return deleted as unknown as T;
    }

    if (path.endsWith("/create-role")) {
      // createOrganizationRole is not available in @clerk/backend@3.10.0.
      throw new Error("Custom role creation requires a newer Clerk version.");
    }

    if (path.endsWith("/update-role")) {
      // updateOrganizationRole is not available in @clerk/backend@3.10.0.
      throw new Error("Custom role update requires a newer Clerk version.");
    }

    if (path.endsWith("/delete-role")) {
      // deleteOrganizationRole is not available in @clerk/backend@3.10.0.
      throw new Error("Custom role deletion requires a newer Clerk version.");
    }

    if (path.endsWith("/accept-invitation")) {
      return { organizationId } as unknown as T;
    }

    console.warn(`[clerk-org-proxy] Unknown path: ${path}`);
    return (input.body ?? { organizationId, id: "clerk-default" }) as unknown as T;
  } catch (error) {
    console.error("[clerk-org-proxy] Error for path:", path, {
      organizationId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export type { ClerkOrganization };