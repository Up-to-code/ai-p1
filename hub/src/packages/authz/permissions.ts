import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const organizationPermissionStatement = {
  ...defaultStatements,
  organization: ["read", "update", "delete"],
  team: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  integration: ["create", "read", "update", "delete"],
  apiKey: ["create", "read", "update", "delete"],
  oauthApp: ["create", "read", "update", "delete", "authorize"],
} as const;

export const organizationAccessControl = createAccessControl(
  organizationPermissionStatement,
);

// Shared roles keep Better Auth, Hono, and Convex aligned around the organization boundary.
export const organizationOwnerRole = organizationAccessControl.newRole({
  ...ownerAc.statements,
  organization: ["read", "update", "delete"],
  team: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  integration: ["create", "read", "update", "delete"],
  apiKey: ["create", "read", "update", "delete"],
  oauthApp: ["create", "read", "update", "delete", "authorize"],
});

export const organizationAdminRole = organizationAccessControl.newRole({
  ...adminAc.statements,
  organization: ["read", "update"],
  team: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  role: ["read"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  integration: ["create", "read", "update"],
  apiKey: ["create", "read", "delete"],
  oauthApp: ["create", "read", "update", "authorize"],
});

export const organizationMemberRole = organizationAccessControl.newRole({
  ...memberAc.statements,
  organization: ["read"],
  team: ["read"],
  member: ["read"],
  role: ["read"],
  client: ["read"],
  task: ["read"],
  project: ["read"],
  property: ["read"],
  calendar: ["read"],
  integration: ["read"],
  apiKey: ["read"],
  oauthApp: ["read"],
});

export const organizationRoles = {
  owner: organizationOwnerRole,
  admin: organizationAdminRole,
  member: organizationMemberRole,
};

export type OrganizationPermissionStatement =
  typeof organizationPermissionStatement;
export type OrganizationRoleName = keyof typeof organizationRoles;
