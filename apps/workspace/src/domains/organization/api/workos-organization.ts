"use client";

import type { OrganizationPermissionStatement } from "@/packages/authz";
import {
  organizationApiPath,
  readOrganizationJsonResponse,
  requestOrganizationAction,
} from "./organization-request";

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
  | "member"
  | "client"
  | "property"
  | "project"
  | "calendar"
  | "task"
  | "integration"
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
  canReadMembers: boolean;
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
  canReadIntegrations: boolean;
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

export function updateAuthOrganization(
  organizationId: string,
  data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, unknown> },
) {
  return requestOrganizationAction<{ organization: unknown }>(
    organizationApiPath(organizationId, "identity"),
    "PATCH",
    data,
    "Organization update failed.",
  ).then((result) => result.organization);
}

export async function listOrganizationMembers(organizationId: string) {
  return requestOrganizationAction<{ members: OrganizationMember[] }>(
    organizationApiPath(organizationId, "members"),
    "GET",
    undefined,
    "Members could not be loaded.",
  ).then((result) => result.members);
}

export function createOrganizationInvitation(organizationId: string, input: { email: string; role: string }) {
  return requestOrganizationAction<{ invitation: OrganizationInvitation }>(
    organizationApiPath(organizationId, "invitations"),
    "POST",
    input,
    "Invitation could not be created.",
  ).then((result) => result.invitation);
}

export function listOrganizationInvitations(organizationId: string) {
  return requestOrganizationAction<{ invitations: OrganizationInvitation[] }>(
    organizationApiPath(organizationId, "invitations"),
    "GET",
    undefined,
    "Invitations could not be loaded.",
  ).then((result) => result.invitations);
}

export function cancelOrganizationInvitation(organizationId: string, invitationId: string) {
  return requestOrganizationAction<{ invitation: unknown }>(
    organizationApiPath(organizationId, "invitations", invitationId),
    "DELETE",
    undefined,
    "Invitation could not be canceled.",
  ).then((result) => result.invitation);
}

export function updateOrganizationMemberRole(organizationId: string, memberId: string, role: string) {
  return requestOrganizationAction<{ member: unknown }>(
    organizationApiPath(organizationId, "members", memberId, "role"),
    "PATCH",
    { role },
    "Member role could not be updated.",
  ).then((result) => result.member);
}

export function removeOrganizationMember(organizationId: string, memberIdOrEmail: string) {
  return requestOrganizationAction<{ member: unknown }>(
    organizationApiPath(organizationId, "members", memberIdOrEmail),
    "DELETE",
    undefined,
    "Member could not be removed.",
  ).then((result) => result.member);
}

export function listOrganizationRoles(organizationId: string) {
  return requestOrganizationAction<{ roles: OrganizationRole[] }>(
    organizationApiPath(organizationId, "roles"),
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
    organizationApiPath(organizationId, "roles"),
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
    organizationApiPath(organizationId, "roles", roleId),
    "PATCH",
    data,
    "Role could not be updated.",
  ).then((result) => result.role);
}

export function deleteOrganizationRole(organizationId: string, roleId: string) {
  return requestOrganizationAction<{ role: unknown }>(
    organizationApiPath(organizationId, "roles", roleId),
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

export function getOrganizationCapabilities(organizationId: string) {
  return requestOrganizationAction<{ capabilities: OrganizationCapabilities }>(
    organizationApiPath(organizationId, "capabilities"),
    "GET",
    undefined,
    "Organization access could not be loaded.",
  ).then((result) => result.capabilities);
}

export function listOrganizationMcpConnections(organizationId: string) {
  return requestOrganizationAction<{ connections: OrganizationMcpConnection[] }>(
    organizationApiPath(organizationId, "mcp-connections"),
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
    organizationApiPath(organizationId, "mcp-connections"),
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
    organizationApiPath(organizationId, "mcp-connections", connectionId),
    "PATCH",
    input,
    "Agent link could not be updated.",
  ).then((result) => result.connection);
}

export function revokeOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return requestOrganizationAction<{ revoked: boolean }>(
    organizationApiPath(organizationId, "mcp-connections", connectionId),
    "DELETE",
    undefined,
    "Agent link could not be revoked.",
  );
}

export function rotateOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return requestOrganizationAction<{ connection: OrganizationMcpConnection; agentLink: string }>(
    organizationApiPath(organizationId, "mcp-connections", connectionId, "rotate"),
    "POST",
    undefined,
    "A new link could not be made.",
  );
}

export function listOrganizationApiKeys(organizationId: string) {
  return requestOrganizationAction<{ keys: OrganizationApiKey[] }>(
    organizationApiPath(organizationId, "api-keys"),
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
    organizationApiPath(organizationId, "api-keys"),
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
    organizationApiPath(organizationId, "api-keys", apiKeyId, "rotate"),
    "POST",
    input,
    "API key could not be rotated.",
  );
}

export function revokeOrganizationApiKey(organizationId: string, apiKeyId: string) {
  return requestOrganizationAction<{ revoked: boolean }>(
    organizationApiPath(organizationId, "api-keys", apiKeyId),
    "DELETE",
    undefined,
    "API key could not be revoked.",
  );
}

export async function createOrganizationInviteLink(organizationId: string, input: { role: string; locale: string }) {
  return requestOrganizationAction<{ inviteLink: OrganizationInviteLink; inviteUrl: string }>(
    organizationApiPath(organizationId, "invite-links"),
    "POST",
    input,
    "Invite link could not be created.",
  );
}

export async function cancelOrganizationInviteLink(organizationId: string, inviteLinkId: string) {
  return requestOrganizationAction<{ inviteLink: OrganizationInviteLink }>(
    organizationApiPath(organizationId, "invite-links", inviteLinkId),
    "DELETE",
    undefined,
    "Invite link could not be canceled.",
  );
}

export async function acceptOrganizationInviteLink(token: string) {
  return requestOrganizationAction<{ inviteLink: OrganizationInviteLink }>(
    "/api/v1/organizations/invite-links/accept",
    "POST",
    { token },
    "Invite link could not be accepted.",
  ).then((result) => result.inviteLink);
}
