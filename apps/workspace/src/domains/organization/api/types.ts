"use client";

import type { OrganizationPermissionStatement } from "@qentrah/auth";

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
  | "project"
  | "deal"
  | "calendar"
  | "task"
  | "media"
  | "space";

export type McpPermissionAction = "read" | "create" | "update" | "delete";

export type OrganizationApiKeyResource =
  | "organization"
  | "client"
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
  principalType: "user" | "organization";
  principalUserId?: string;
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
