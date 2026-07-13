import type { ToolContext } from "eve/tools";
import { requireWorkspaceActorToken } from "./workspace-actor";

type OrganizationRole = { id: string; role: string; key?: string };
type OrganizationMember = { id: string; userId: string; role: string };
type OrganizationInvitation = { id: string; role: string; status?: string };

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getSessionToken(ctx: ToolContext): string {
  return requireWorkspaceActorToken(ctx, "sessionToken");
}

async function betterAuthFetch<T>(
  ctx: ToolContext,
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${appBaseUrl}/api/auth${path}`, {
    method: options.method ?? "POST",
    headers: {
      "content-type": "application/json",
      cookie: `better-auth.session_token=${getSessionToken(ctx)}`,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Organization action failed: ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function updateOrganizationIdentity(
  ctx: ToolContext,
  organizationId: string,
  input: { name?: string; logo?: string },
) {
  return betterAuthFetch<{ id: string }>(ctx, "/organization/update", {
    body: { organizationId, data: input },
  });
}

export async function createOrganizationInvitation(
  ctx: ToolContext,
  organizationId: string,
  input: { emailAddress: string; role: string },
) {
  return betterAuthFetch<{ id: string }>(ctx, "/organization/invite-member", {
    body: { organizationId, email: input.emailAddress, role: input.role },
  });
}

export async function revokeOrganizationInvitation(
  ctx: ToolContext,
  _organizationId: string,
  invitationId: string,
) {
  return betterAuthFetch<{ id: string }>(ctx, "/organization/cancel-invitation", {
    body: { invitationId },
  });
}

export async function updateOrganizationMemberRole(
  ctx: ToolContext,
  organizationId: string,
  memberId: string,
  role: string,
) {
  return betterAuthFetch<{ id: string }>(ctx, "/organization/update-member-role", {
    body: { organizationId, memberId, role },
  });
}

export async function removeOrganizationMember(
  ctx: ToolContext,
  organizationId: string,
  memberIdOrEmail: string,
) {
  return betterAuthFetch<{ id: string }>(ctx, "/organization/remove-member", {
    body: { organizationId, memberIdOrEmail },
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
  const data = await betterAuthFetch<{ members?: OrganizationMember[] }>(
    ctx,
    "/organization/list-members",
    { body: { organizationId } },
  );
  return data.members ?? [];
}

export async function listOrganizationInvitations(ctx: ToolContext, organizationId: string) {
  const data = await betterAuthFetch<OrganizationInvitation[] | { invitations?: OrganizationInvitation[] }>(
    ctx,
    "/organization/list-invitations",
    { body: { organizationId } },
  );
  return Array.isArray(data) ? data : data.invitations ?? [];
}

export async function listOrganizationRoles(_ctx: ToolContext, _organizationId: string): Promise<OrganizationRole[]> {
  return [
    { id: "owner", role: "owner", key: "owner" },
    { id: "admin", role: "admin", key: "admin" },
    { id: "member", role: "member", key: "member" },
  ];
}
