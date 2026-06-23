import type { PermissionResource } from "./settings-view-model";

export type WorkArea = {
  resource: PermissionResource;
  labelKey: string;
  helperKey: string;
  advanced?: boolean;
};

export type WorkRoleTemplate = {
  id: string;
  suggestedName: string;
  labelKey: string;
  helperKey: string;
  permission: Partial<Record<PermissionResource, string[]>>;
};

export const workAreas: WorkArea[] = [
  { resource: "organization", labelKey: "organization", helperKey: "organization" },
  { resource: "team", labelKey: "team", helperKey: "team" },
  { resource: "member", labelKey: "member", helperKey: "member" },
  { resource: "project", labelKey: "project", helperKey: "project" },
  { resource: "client", labelKey: "client", helperKey: "client" },
  { resource: "task", labelKey: "task", helperKey: "task" },
  { resource: "calendar", labelKey: "calendar", helperKey: "calendar" },
  { resource: "media", labelKey: "media", helperKey: "media" },
  { resource: "visibility", labelKey: "visibility", helperKey: "visibility" },
  { resource: "integration", labelKey: "integration", helperKey: "integration" },
];

export const advancedWorkAreas: WorkArea[] = [
  { resource: "apiKey", labelKey: "apiKey", helperKey: "apiKey", advanced: true },
  { resource: "oauthApp", labelKey: "oauthApp", helperKey: "oauthApp", advanced: true },
  { resource: "role", labelKey: "role", helperKey: "role", advanced: true },
];

export const workRoleTemplates: WorkRoleTemplate[] = [
  {
    id: "owner",
    suggestedName: "owner-operator",
    labelKey: "owner",
    helperKey: "owner",
    permission: {
      organization: ["read", "update", "delete"],
      team: ["create", "read", "update", "delete"],
      member: ["create", "read", "update", "delete"],
      role: ["create", "read", "update", "delete"],
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["create", "read", "update", "delete"],
      calendar: ["create", "read", "update", "delete"],
      media: ["create", "read", "update", "delete"],
      integration: ["create", "read", "update", "delete"],
      apiKey: ["create", "read", "update", "delete"],
      oauthApp: ["create", "read", "update", "delete", "authorize"],
    },
  },
  {
    id: "operations-manager",
    suggestedName: "operations-manager",
    labelKey: "operationsManager",
    helperKey: "operationsManager",
    permission: {
      organization: ["read", "update"],
      team: ["create", "read", "update"],
      member: ["create", "read", "update"],
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["create", "read", "update", "delete"],
      calendar: ["create", "read", "update", "delete"],
      media: ["create", "read", "update", "delete"],
      integration: ["read", "update"],
    },
  },
  {
    id: "project-manager",
    suggestedName: "project-manager",
    labelKey: "projectManager",
    helperKey: "projectManager",
    permission: {
      project: ["create", "read", "update", "delete"],
      client: ["read", "update"],
      task: ["read", "update"],
      calendar: ["create", "read", "update"],
      media: ["create", "read", "update"],
      member: ["read"],
      team: ["read"],
    },
  },
  {
    id: "crm-sales",
    suggestedName: "crm-sales",
    labelKey: "crmSales",
    helperKey: "crmSales",
    permission: {
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["read"],
      calendar: ["create", "read", "update"],
      media: ["create", "read"],
    },
  },
  {
    id: "calendar-coordinator",
    suggestedName: "calendar-coordinator",
    labelKey: "calendarCoordinator",
    helperKey: "calendarCoordinator",
    permission: {
      calendar: ["create", "read", "update", "delete"],
      client: ["read"],
      task: ["read", "update"],
      project: ["read"],
      member: ["read"],
      media: ["read"],
    },
  },
  {
    id: "viewer",
    suggestedName: "viewer",
    labelKey: "viewer",
    helperKey: "viewer",
    permission: {
      organization: ["read"],
      team: ["read"],
      member: ["read"],
      client: ["read"],
      task: ["read"],
      project: ["read"],
      calendar: ["read"],
      media: ["read"],
      integration: ["read"],
    },
  },
];
