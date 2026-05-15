"use client";

import { authClient } from "@/lib/auth-client";
import type { OrganizationPermissionStatement } from "@/packages/authz";

type AuthError = {
  message?: string;
  code?: string;
  status?: number;
};

type AuthResult<T> = {
  data?: T | null;
  error?: AuthError | null;
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date | string;
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
};

export type OrganizationInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  inviterId: string;
  expiresAt: Date | string;
  createdAt: Date | string;
};

export type OrganizationInvitationAcceptance = {
  organizationId?: string;
  invitation?: {
    organizationId?: string;
  };
  member?: {
    organizationId?: string;
  };
};

export type OrganizationInviteLink = {
  id: string;
  organizationId: string;
  role: string;
  status: "pending" | "used" | "canceled";
  createdByUserId: string;
  expiresAt: number;
  usedAt?: number;
  usedByUserId?: string;
  createdAt: number;
  updatedAt: number;
};

export type McpPermissionResource =
  | "organization"
  | "client"
  | "property"
  | "project"
  | "calendar"
  | "task"
  | "media";

export type McpPermissionAction = "read" | "create" | "update" | "delete";

export type OrganizationApiKeyResource =
  | "organization"
  | "client"
  | "property"
  | "project"
  | "calendar"
  | "task"
  | "media";

export type OrganizationApiKeyAction = "read" | "create" | "update" | "delete";

export type OrganizationApiKeyPermission = {
  resource: OrganizationApiKeyResource;
  actions: OrganizationApiKeyAction[];
};

export type OrganizationApiKeyExpiry = "5h" | "14d" | "30d" | "never";

export type McpConnectionPermission = {
  resource: McpPermissionResource;
  actions: McpPermissionAction[];
};

export type OrganizationMcpConnection = {
  _id: string;
  id: string;
  organizationId: string;
  publicId: string;
  keyId: string;
  keyLast4: string;
  name: string;
  instructions?: string;
  permissions: McpConnectionPermission[];
  status: "active" | "paused" | "draft" | "revoked";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
  usageCount: number;
  revokedAt?: number;
};

export type OrganizationApiKey = {
  _id: string;
  id: string;
  organizationId: string;
  keyId: string;
  keyLast4: string;
  name: string;
  permissions: OrganizationApiKeyPermission[];
  status: "active" | "revoked" | "expired";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
  usageCount: number;
  quotaWindowStartedAt?: number;
  quotaLimit: number;
  quotaWindowMs: number;
  quotaUsed: number;
  revokedAt?: number;
};

export type OrganizationRole = {
  id: string;
  organizationId: string;
  role: string;
  permission: Partial<Record<keyof OrganizationPermissionStatement, string[]>>;
  createdAt: Date | string;
  updatedAt?: Date | string;
};

export type OrganizationCapabilities = {
  canReadOrganization: boolean;
  canUpdateOrganization: boolean;
  canInviteMembers: boolean;
  canUpdateMembers: boolean;
  canRemoveMembers: boolean;
  canReadRoles: boolean;
  canCreateRoles: boolean;
  canUpdateRoles: boolean;
  canDeleteRoles: boolean;
  canReadProjects: boolean;
  canCreateProjects: boolean;
  canUpdateProjects: boolean;
  canDeleteProjects: boolean;
  canReadProperties: boolean;
  canCreateProperties: boolean;
  canUpdateProperties: boolean;
  canDeleteProperties: boolean;
  canReadClients: boolean;
  canCreateClients: boolean;
  canUpdateClients: boolean;
  canDeleteClients: boolean;
  canReadTasks: boolean;
  canCreateTasks: boolean;
  canUpdateTasks: boolean;
  canDeleteTasks: boolean;
  canReadMedia: boolean;
  canCreateMedia: boolean;
  canUpdateMedia: boolean;
  canDeleteMedia: boolean;
  canReadApiKeys: boolean;
  canCreateApiKeys: boolean;
  canUpdateApiKeys: boolean;
  canDeleteApiKeys: boolean;
  canReadCalendarEvents: boolean;
  canCreateCalendarEvents: boolean;
  canUpdateCalendarEvents: boolean;
  canDeleteCalendarEvents: boolean;
  isPlatformAdmin: boolean;
  canManageVisibility: boolean;
};

type OrganizationApi = {
  organization: {
    update: (input: {
      organizationId: string;
      data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, unknown> };
    }) => Promise<AuthResult<unknown>>;
    listMembers: (input: { query: { organizationId: string; limit?: number; offset?: number } }) => Promise<AuthResult<{ members: OrganizationMember[]; total?: number } | OrganizationMember[]>>;
    createInvitation: (input: { email: string; role: string; organizationId: string; resend?: boolean }) => Promise<AuthResult<OrganizationInvitation>>;
    listInvitations: (input: { query: { organizationId: string } }) => Promise<AuthResult<OrganizationInvitation[]>>;
    cancelInvitation: (input: { invitationId: string }) => Promise<AuthResult<unknown>>;
    updateMemberRole: (input: { memberId: string; role: string; organizationId: string }) => Promise<AuthResult<unknown>>;
    removeMember: (input: { memberIdOrEmail: string; organizationId: string }) => Promise<AuthResult<unknown>>;
    listOrgRoles: (input: { query: { organizationId: string } }) => Promise<AuthResult<OrganizationRole[]>>;
    createOrgRole: (input: {
      organizationId: string;
      role: string;
      permission: Partial<Record<keyof OrganizationPermissionStatement, string[]>>;
    }) => Promise<AuthResult<{ roleData: OrganizationRole }>>;
    updateOrgRole: (input: {
      organizationId: string;
      roleId: string;
      data: {
        roleName?: string;
        permission?: Partial<Record<keyof OrganizationPermissionStatement, string[]>>;
      };
    }) => Promise<AuthResult<{ roleData: OrganizationRole }>>;
    deleteOrgRole: (input: { organizationId: string; roleId: string }) => Promise<AuthResult<unknown>>;
    acceptInvitation: (input: { invitationId: string }) => Promise<AuthResult<unknown>>;
  };
};

const organizationApi = authClient as unknown as OrganizationApi;

function assertOk<T>(result: AuthResult<T>, fallback: string): T {
  if (result.error) {
    throw new Error(result.error.message ?? result.error.code ?? fallback);
  }

  return result.data as T;
}

export function updateAuthOrganization(
  organizationId: string,
  data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, unknown> },
) {
  return requestOrganizationAction<{ organization: unknown }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/identity`,
    "PATCH",
    data,
    "Organization update failed.",
  ).then((result) => result.organization);
}

export async function listOrganizationMembers(organizationId: string) {
  const data = await organizationApi.organization
    .listMembers({ query: { organizationId, limit: 100, offset: 0 } })
    .then((result) => assertOk(result, "Members could not be loaded."));

  return Array.isArray(data) ? data : data.members;
}

export function createOrganizationInvitation(organizationId: string, input: { email: string; role: string }) {
  return requestOrganizationAction<{ invitation: OrganizationInvitation }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/invitations`,
    "POST",
    input,
    "Invitation could not be created.",
  ).then((result) => result.invitation);
}

export function listOrganizationInvitations(organizationId: string) {
  return organizationApi.organization
    .listInvitations({ query: { organizationId } })
    .then((result) => assertOk(result, "Invitations could not be loaded."));
}

export function cancelOrganizationInvitation(organizationId: string, invitationId: string) {
  return requestOrganizationAction<{ invitation: unknown }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/invitations/${encodeURIComponent(invitationId)}`,
    "DELETE",
    undefined,
    "Invitation could not be canceled.",
  ).then((result) => result.invitation);
}

export function updateOrganizationMemberRole(organizationId: string, memberId: string, role: string) {
  return requestOrganizationAction<{ member: unknown }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(memberId)}/role`,
    "PATCH",
    { role },
    "Member role could not be updated.",
  ).then((result) => result.member);
}

export function removeOrganizationMember(organizationId: string, memberIdOrEmail: string) {
  return requestOrganizationAction<{ member: unknown }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(memberIdOrEmail)}`,
    "DELETE",
    undefined,
    "Member could not be removed.",
  ).then((result) => result.member);
}

export function listOrganizationRoles(organizationId: string) {
  return requestOrganizationAction<{ roles: OrganizationRole[] }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/roles`,
    "GET",
    undefined,
    "Roles could not be loaded.",
  ).then((result) => result.roles);
}

export function createOrganizationRole(
  organizationId: string,
  role: string,
  permission: Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
) {
  return requestOrganizationAction<{ role: { roleData: OrganizationRole } }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/roles`,
    "POST",
    { role, permission },
    "Role could not be created.",
  ).then((result) => result.role);
}

export function updateOrganizationRole(
  organizationId: string,
  roleId: string,
  data: {
    roleName?: string;
    permission?: Partial<Record<keyof OrganizationPermissionStatement, string[]>>;
  },
) {
  return requestOrganizationAction<{ role: { roleData: OrganizationRole } }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/roles/${encodeURIComponent(roleId)}`,
    "PATCH",
    data,
    "Role could not be updated.",
  ).then((result) => result.role);
}

export function deleteOrganizationRole(organizationId: string, roleId: string) {
  return requestOrganizationAction<{ role: unknown }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/roles/${encodeURIComponent(roleId)}`,
    "DELETE",
    undefined,
    "Role could not be deleted.",
  ).then((result) => result.role);
}

export function acceptOrganizationInvitation(invitationId: string) {
  return requestOrganizationAction<OrganizationInvitationAcceptance>(
    "/api/v1/organizations/invitations/accept",
    "POST",
    { invitationId },
    "Invitation could not be accepted.",
  );
}

async function readJsonResponse<T>(response: Response, fallback: string): Promise<T> {
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? fallback);
  }

  return payload as T;
}

async function requestOrganizationAction<T>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body: unknown,
  fallback: string,
) {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return readJsonResponse<T>(response, fallback);
}

export function getOrganizationCapabilities(organizationId: string) {
  return requestOrganizationAction<{ capabilities: OrganizationCapabilities }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/capabilities`,
    "GET",
    undefined,
    "Organization access could not be loaded.",
  ).then((result) => result.capabilities);
}

export function listOrganizationMcpConnections(organizationId: string) {
  return requestOrganizationAction<{ connections: OrganizationMcpConnection[] }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/mcp-connections`,
    "GET",
    undefined,
    "Agent links could not be loaded.",
  ).then((result) => result.connections);
}

export function createOrganizationMcpConnection(
  organizationId: string,
  input: {
    name: string;
    instructions?: string;
    permissions: McpConnectionPermission[];
    expiresAt?: number;
  },
) {
  return requestOrganizationAction<{ connection: OrganizationMcpConnection; agentLink: string }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/mcp-connections`,
    "POST",
    input,
    "Agent link could not be created.",
  );
}

export function updateOrganizationMcpConnection(
  organizationId: string,
  connectionId: string,
  input: {
    name?: string;
    instructions?: string;
    permissions?: McpConnectionPermission[];
    status?: "active" | "paused";
    expiresAt?: number | null;
  },
) {
  return requestOrganizationAction<{ connection: OrganizationMcpConnection }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/mcp-connections/${encodeURIComponent(connectionId)}`,
    "PATCH",
    input,
    "Agent link could not be updated.",
  ).then((result) => result.connection);
}

export function revokeOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return requestOrganizationAction<{ revoked: boolean }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/mcp-connections/${encodeURIComponent(connectionId)}`,
    "DELETE",
    undefined,
    "Agent link could not be revoked.",
  );
}

export function rotateOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return requestOrganizationAction<{ connection: OrganizationMcpConnection; agentLink: string }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/mcp-connections/${encodeURIComponent(connectionId)}/rotate`,
    "POST",
    undefined,
    "A new link could not be made.",
  );
}

export function listOrganizationApiKeys(organizationId: string) {
  return requestOrganizationAction<{ keys: OrganizationApiKey[] }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/api-keys`,
    "GET",
    undefined,
    "API keys could not be loaded.",
  ).then((result) => result.keys);
}

export function createOrganizationApiKey(
  organizationId: string,
  input: {
    name: string;
    permissions: OrganizationApiKeyPermission[];
    expiry: OrganizationApiKeyExpiry;
  },
) {
  return requestOrganizationAction<{ key: OrganizationApiKey; apiKey: string }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/api-keys`,
    "POST",
    input,
    "API key could not be created.",
  );
}

export function rotateOrganizationApiKey(
  organizationId: string,
  apiKeyId: string,
  input: { expiry: OrganizationApiKeyExpiry },
) {
  return requestOrganizationAction<{ key: OrganizationApiKey; apiKey: string }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/api-keys/${encodeURIComponent(apiKeyId)}/rotate`,
    "POST",
    input,
    "API key could not be rotated.",
  );
}

export function revokeOrganizationApiKey(organizationId: string, apiKeyId: string) {
  return requestOrganizationAction<{ revoked: boolean }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/api-keys/${encodeURIComponent(apiKeyId)}`,
    "DELETE",
    undefined,
    "API key could not be revoked.",
  );
}

export async function createOrganizationInviteLink(organizationId: string, input: { role: string; locale: string }) {
  const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/invite-links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return readJsonResponse<{ inviteLink: OrganizationInviteLink; inviteUrl: string }>(
    response,
    "Invite link could not be created.",
  );
}

export async function cancelOrganizationInviteLink(organizationId: string, inviteLinkId: string) {
  const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/invite-links/${encodeURIComponent(inviteLinkId)}`, {
    method: "DELETE",
  });

  return readJsonResponse<{ inviteLink: OrganizationInviteLink }>(
    response,
    "Invite link could not be canceled.",
  );
}

export async function acceptOrganizationInviteLink(token: string) {
  const response = await fetch("/api/v1/organizations/invite-links/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  return readJsonResponse<{ inviteLink: OrganizationInviteLink }>(
    response,
    "Invite link could not be accepted.",
  ).then((result) => result.inviteLink);
}
