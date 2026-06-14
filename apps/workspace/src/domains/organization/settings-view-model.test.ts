import { describe, expect, it } from "vitest";
import {
  agentPermissionActions,
  agentConnectionProjection,
  agentPermissionSummary,
  apiKeyStats,
  clampAgentPermissionsToGrantable,
  cloneAgentPermissions,
  defaultApiKeyPermissions,
  grantableAgentPermissions,
  grantableApiKeyPermissions,
  hasAgentDeletePermission,
  canManageCustomPermissions,
  memberRoleCount,
  normalizeOrganizationSettingsTab,
  organizationSettingsTabs,
  ownerMemberCount,
  pendingInvitationCount,
  toggleAgentPermission,
  toggleApiKeyPermission,
  toggleRolePermissionAction,
} from "./settings-view-model";
import type {
  McpConnectionPermission,
  OrganizationApiKeyPermission,
  OrganizationCapabilities,
} from "./api/clerk-organization-api";

const baseCapabilities: OrganizationCapabilities = {
  canReadOrganization: true,
  canUpdateOrganization: false,
  canInviteMembers: false,
  canUpdateMembers: false,
  canRemoveMembers: false,
  canReadRoles: false,
  canCreateRoles: false,
  canUpdateRoles: false,
  canDeleteRoles: false,
  canReadProjects: true,
  canCreateProjects: false,
  canUpdateProjects: true,
  canDeleteProjects: false,
  canReadProperties: true,
  canCreateProperties: true,
  canUpdateProperties: false,
  canDeleteProperties: false,
  canReadClients: true,
  canCreateClients: true,
  canUpdateClients: true,
  canDeleteClients: false,
  canReadTasks: true,
  canCreateTasks: false,
  canUpdateTasks: false,
  canDeleteTasks: false,
  canReadMedia: true,
  canCreateMedia: false,
  canUpdateMedia: false,
  canDeleteMedia: false,
  canReadApiKeys: false,
  canCreateApiKeys: false,
  canUpdateApiKeys: false,
  canDeleteApiKeys: false,
  canReadCalendarEvents: true,
  canCreateCalendarEvents: true,
  canUpdateCalendarEvents: false,
  canDeleteCalendarEvents: false,
  isPlatformAdmin: false,
  canManageVisibility: false,
};

describe("organization settings permission view model", () => {
  it("keeps the primary organization tabs complete", () => {
    expect(organizationSettingsTabs).toEqual(["profile", "members", "agentLinks", "apiKeys", "notifications"]);
  });

  it("normalizes stale role tab URLs back to members", () => {
    expect(normalizeOrganizationSettingsTab("roles")).toBe("members");
    expect(normalizeOrganizationSettingsTab("apiKeys")).toBe("apiKeys");
    expect(normalizeOrganizationSettingsTab("unknown")).toBe("profile");
    expect(normalizeOrganizationSettingsTab(null)).toBe("profile");
  });

  it("allows owners to manage custom permissions", () => {
    expect(canManageCustomPermissions({
      capabilities: baseCapabilities,
      currentMemberRole: "owner",
    })).toBe(true);
    expect(canManageCustomPermissions({
      capabilities: baseCapabilities,
      currentMemberRole: "admin,owner",
    })).toBe(true);
  });

  it("allows non-owners only with role and member management permissions", () => {
    expect(canManageCustomPermissions({
      capabilities: {
        ...baseCapabilities,
        canCreateRoles: true,
        canUpdateRoles: true,
        canUpdateMembers: true,
      },
      currentMemberRole: "operations-manager",
    })).toBe(true);
  });

  it("denies partial custom permission management grants", () => {
    expect(canManageCustomPermissions({
      capabilities: {
        ...baseCapabilities,
        canCreateRoles: true,
        canUpdateRoles: true,
        canUpdateMembers: false,
      },
      currentMemberRole: "operations-manager",
    })).toBe(false);
    expect(canManageCustomPermissions({
      capabilities: undefined,
      currentMemberRole: null,
    })).toBe(false);
  });

  it("projects capabilities into grantable Agent permissions", () => {
    expect(grantableAgentPermissions(baseCapabilities)).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "create", "update"] },
      { resource: "project", actions: ["read", "update"] },
      { resource: "calendar", actions: ["read", "create"] },
      { resource: "task", actions: ["read"] },
      { resource: "media", actions: ["read"] },
    ]);
  });

  it("clamps Agent drafts and formats summaries", () => {
    const draft: McpConnectionPermission[] = [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "delete"] },
      { resource: "media", actions: ["delete"] },
    ];
    const grantable = grantableAgentPermissions(baseCapabilities);
    const cloned = cloneAgentPermissions(draft);

    expect(cloned).not.toBe(draft);
    expect(agentPermissionActions(draft, "client")).toEqual(["read", "delete"]);
    expect(hasAgentDeletePermission(draft)).toBe(true);
    expect(clampAgentPermissionsToGrantable(draft, grantable)).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
    ]);
    expect(agentPermissionSummary(draft, {
      resource: (resource) => resource,
      action: (action) => action,
    })).toBe("client: read, delete • media: delete");
  });

  it("projects API key grants to read-only defaults", () => {
    const grantable = grantableApiKeyPermissions(baseCapabilities);

    expect(grantable).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "create", "update"] },
      { resource: "project", actions: ["read"] },
      { resource: "calendar", actions: ["read"] },
      { resource: "task", actions: ["read"] },
      { resource: "media", actions: ["read"] },
    ] satisfies OrganizationApiKeyPermission[]);
    expect(defaultApiKeyPermissions(grantable)).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "project", actions: ["read"] },
      { resource: "calendar", actions: ["read"] },
      { resource: "task", actions: ["read"] },
      { resource: "media", actions: ["read"] },
    ]);
  });

  it("projects organization member and invite counts", () => {
    const members = [
      { role: "owner" },
      { role: "admin,owner" },
      { role: "member" },
      { role: "custom" },
    ];

    expect(ownerMemberCount(members as never)).toBe(2);
    expect(memberRoleCount(members as never, "custom")).toBe(1);
    expect(pendingInvitationCount([{ status: "pending" }, { status: "accepted" }])).toBe(1);
  });

  it("projects Agent link buckets and stats", () => {
    const connections = [
      { status: "active", usageCount: 3 },
      { status: "paused", usageCount: 2 },
      { status: "draft", usageCount: 1 },
      { status: "revoked", usageCount: 4 },
    ];

    expect(agentConnectionProjection(connections as never, false)).toMatchObject({
      workingConnections: [{ status: "active", usageCount: 3 }, { status: "paused", usageCount: 2 }],
      draftConnections: [{ status: "draft", usageCount: 1 }],
      visibleConnections: [{ status: "active", usageCount: 3 }, { status: "paused", usageCount: 2 }],
      stats: { active: 1, calls: 10, drafts: 1 },
    });
    expect(agentConnectionProjection(connections as never, true).visibleConnections.map((connection) => connection.status)).toEqual([
      "active",
      "paused",
      "draft",
    ]);
  });

  it("projects API key stats", () => {
    expect(apiKeyStats([
      { status: "active", usageCount: 3 },
      { status: "revoked", usageCount: 5 },
      { status: "active", usageCount: 7 },
    ])).toEqual({ active: 2, calls: 15 });
  });

  it("toggles Agent permissions only when grantable", () => {
    const current: McpConnectionPermission[] = [{ resource: "client", actions: ["read"] }];
    const grantable: McpConnectionPermission[] = [{ resource: "client", actions: ["read", "update"] }];

    expect(toggleAgentPermission(current, grantable, "client", "update")).toEqual([
      { resource: "client", actions: ["read", "update"] },
    ]);
    expect(toggleAgentPermission(current, grantable, "client", "read")).toEqual([]);
    expect(toggleAgentPermission(current, grantable, "client", "delete")).toBe(current);
  });

  it("toggles API key permissions only when grantable", () => {
    const current: OrganizationApiKeyPermission[] = [{ resource: "client", actions: ["read"] }];
    const grantable: OrganizationApiKeyPermission[] = [{ resource: "client", actions: ["read", "create"] }];

    expect(toggleApiKeyPermission(current, grantable, "client", "create")).toEqual([
      { resource: "client", actions: ["read", "create"] },
    ]);
    expect(toggleApiKeyPermission(current, grantable, "client", "read")).toEqual([]);
    expect(toggleApiKeyPermission(current, grantable, "client", "delete")).toBe(current);
  });

  it("toggles custom role permission actions", () => {
    expect(toggleRolePermissionAction({ client: ["read"] }, "client", "update")).toEqual({
      client: ["read", "update"],
    });
    expect(toggleRolePermissionAction({ client: ["read"] }, "client", "read")).toEqual({
      client: [],
    });
  });
});
