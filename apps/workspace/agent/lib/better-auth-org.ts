import type { ToolContext } from "eve/tools";
import { resolveAuthTopology } from "@qentrah/auth/config";
import type { AuthCredential } from "@qentrah/auth/credentials";
import { createAuthHttpClient } from "@qentrah/auth/http";
import { z } from "zod";
import { requireWorkspaceActorToken } from "./workspace-actor";

const idResponseSchema = z.object({ id: z.string() }).passthrough();
const organizationMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
}).passthrough();
const organizationInvitationSchema = z.object({
  id: z.string(),
  role: z.string(),
  status: z.string().optional(),
}).passthrough();
const organizationMembersSchema = z.object({
  members: z.array(organizationMemberSchema).optional(),
}).passthrough();
const organizationInvitationsSchema = z.union([
  z.array(organizationInvitationSchema),
  z.object({ invitations: z.array(organizationInvitationSchema).optional() }).passthrough(),
]);

type OrganizationRole = { id: string; role: string; key?: string };
const authTopology = resolveAuthTopology();

function getSessionToken(ctx: ToolContext): string {
  return requireWorkspaceActorToken(ctx, "sessionToken");
}

function authClientFor(ctx: ToolContext) {
  const token = getSessionToken(ctx);
  const credential: AuthCredential = {
    kind: "session",
    token,
    cookieName: "better-auth.session_token",
    cookie: `better-auth.session_token=${encodeURIComponent(token)}`,
  };
  return createAuthHttpClient({
    baseUrl: authTopology.authIssuer,
    credentialProvider: () => credential,
  });
}

export async function updateOrganizationIdentity(
  ctx: ToolContext,
  organizationId: string,
  input: { name?: string; logo?: string },
) {
  return authClientFor(ctx).request("/organization/update", {
    body: { organizationId, data: input },
    parse: (value) => idResponseSchema.parse(value),
  });
}

export async function createOrganizationInvitation(
  ctx: ToolContext,
  organizationId: string,
  input: { emailAddress: string; role: string },
) {
  return authClientFor(ctx).request("/organization/invite-member", {
    body: { organizationId, email: input.emailAddress, role: input.role },
    parse: (value) => idResponseSchema.parse(value),
  });
}

export async function revokeOrganizationInvitation(
  ctx: ToolContext,
  _organizationId: string,
  invitationId: string,
) {
  return authClientFor(ctx).request("/organization/cancel-invitation", {
    body: { invitationId },
    parse: (value) => idResponseSchema.parse(value),
  });
}

export async function updateOrganizationMemberRole(
  ctx: ToolContext,
  organizationId: string,
  memberId: string,
  role: string,
) {
  return authClientFor(ctx).request("/organization/update-member-role", {
    body: { organizationId, memberId, role },
    parse: (value) => idResponseSchema.parse(value),
  });
}

export async function removeOrganizationMember(
  ctx: ToolContext,
  organizationId: string,
  memberIdOrEmail: string,
) {
  return authClientFor(ctx).request("/organization/remove-member", {
    body: { organizationId, memberIdOrEmail },
    parse: (value) => idResponseSchema.parse(value),
  });
}

export async function createOrganizationRole(
  _ctx: ToolContext,
  _organizationId: string,
  _input: { name: string; description?: string; permissions?: Record<string, string[]> },
) {
  throw new Error("Custom role creation is not yet supported by the Better Auth organization configuration.");
}

export async function updateOrganizationRole(
  _ctx: ToolContext,
  _organizationId: string,
  _roleId: string,
  _input: { name?: string; permissions?: Record<string, string[]> },
) {
  throw new Error("Custom role update is not yet supported by the Better Auth organization configuration.");
}

export async function deleteOrganizationRole(
  _ctx: ToolContext,
  _organizationId: string,
  _roleId: string,
) {
  throw new Error("Custom role deletion is not yet supported by the Better Auth organization configuration.");
}

export async function listOrganizationMembers(ctx: ToolContext, organizationId: string) {
  const data = await authClientFor(ctx).request("/organization/list-members", {
    body: { organizationId },
    parse: (value) => organizationMembersSchema.parse(value),
  });
  return data.members ?? [];
}

export async function listOrganizationInvitations(ctx: ToolContext, organizationId: string) {
  const data = await authClientFor(ctx).request("/organization/list-invitations", {
    body: { organizationId },
    parse: (value) => organizationInvitationsSchema.parse(value),
  });
  return Array.isArray(data) ? data : data.invitations ?? [];
}

export async function listOrganizationRoles(_ctx: ToolContext, _organizationId: string): Promise<OrganizationRole[]> {
  return [
    { id: "owner", role: "owner", key: "owner" },
    { id: "admin", role: "admin", key: "admin" },
    { id: "member", role: "member", key: "member" },
  ];
}
