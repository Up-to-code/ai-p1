import { describe, expect, it } from "vitest";
import type { OrganizationCapabilities } from "@/domains/organization/api";
import {
  buildMcpPermissionsForPreset,
  buildMcpPermissionsForShareAccess,
} from "./share-mcp-permissions";

const capabilities: OrganizationCapabilities = {
  canReadOrganization: true,
  canUpdateOrganization: false,
  canInviteMembers: true,
  canUpdateMembers: true,
  canRemoveMembers: false,
  canReadRoles: true,
  canCreateRoles: false,
  canUpdateRoles: false,
  canDeleteRoles: false,
  canReadProjects: true,
  canCreateProjects: true,
  canUpdateProjects: false,
  canDeleteProjects: false,
  canReadProperties: false,
  canCreateProperties: false,
  canUpdateProperties: false,
  canDeleteProperties: false,
  canReadClients: true,
  canCreateClients: false,
  canUpdateClients: false,
  canDeleteClients: false,
  canReadTasks: true,
  canCreateTasks: false,
  canUpdateTasks: false,
  canDeleteTasks: false,
  canReadMedia: false,
  canCreateMedia: false,
  canUpdateMedia: false,
  canDeleteMedia: false,
  canReadApiKeys: false,
  canCreateApiKeys: false,
  canUpdateApiKeys: false,
  canDeleteApiKeys: false,
  canReadCalendarEvents: true,
  canCreateCalendarEvents: true,
  canUpdateCalendarEvents: true,
  canDeleteCalendarEvents: false,
  isPlatformAdmin: false,
  canManageVisibility: false,
};

describe("buildMcpPermissionsForShareAccess", () => {
  it("returns read-only permissions for viewers", () => {
    expect(buildMcpPermissionsForShareAccess(capabilities, "viewer")).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "project", actions: ["read"] },
      { resource: "deal", actions: ["read"] },
      { resource: "calendar", actions: ["read"] },
      { resource: "task", actions: ["read"] },
    ]);
  });

  it("includes write actions for editors when allowed", () => {
    expect(buildMcpPermissionsForShareAccess(capabilities, "editor")).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "project", actions: ["read", "create"] },
      { resource: "deal", actions: ["read"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read"] },
    ]);
  });

  it("returns an empty list when capabilities are unavailable", () => {
    expect(buildMcpPermissionsForShareAccess(undefined, "editor")).toEqual([]);
  });
});

describe("buildMcpPermissionsForPreset", () => {
  it("maps the client preset to organization, client, and task permissions", () => {
    expect(buildMcpPermissionsForPreset(capabilities, "client")).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "task", actions: ["read"] },
    ]);
  });

  it("maps the calendar preset to calendar write permissions when allowed", () => {
    expect(buildMcpPermissionsForPreset(capabilities, "calendar")).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read"] },
    ]);
  });

  it("maps the full preset through capability gates", () => {
    expect(buildMcpPermissionsForPreset(capabilities, "full")).toEqual([
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "project", actions: ["read", "create"] },
      { resource: "deal", actions: ["read"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read"] },
    ]);
  });
});
