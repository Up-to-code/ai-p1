type PermissionStatements = Record<string, readonly string[]>;

function newRole(statements: PermissionStatements) {
  return {
    statements,
    authorize(request: Partial<Record<string, readonly string[]>>) {
      const success = Object.entries(request).every(([resource, actions]) => {
        const allowed = statements[resource] ?? [];
        return (actions ?? []).every((action) => allowed.includes(action));
      });
      return { success };
    },
  };
}

function createAccessControl(statements: PermissionStatements) {
  return {
    statements,
    newRole,
  };
}

export const organizationPermissionStatement = {
  organization: ["read", "update", "delete"],
  team: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  visibility: ["read", "update"],
  integration: ["create", "read", "update", "delete"],
  apiKey: ["create", "read", "update", "delete"],
  oauthApp: ["create", "read", "update", "delete", "authorize"],
} as const;

export const organizationAccessControl = createAccessControl(
  organizationPermissionStatement,
);

// Shared roles keep WorkOS, Hono, and Convex aligned around the organization boundary.
export const organizationOwnerRole = organizationAccessControl.newRole({
  organization: ["read", "update", "delete"],
  team: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  visibility: ["read"],
  integration: ["create", "read", "update", "delete"],
  apiKey: ["create", "read", "update", "delete"],
  oauthApp: ["create", "read", "update", "delete", "authorize"],
});

export const organizationAdminRole = organizationAccessControl.newRole({
  organization: ["read"],
  team: ["read"],
  member: ["read"],
  role: ["read"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  property: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  visibility: ["read"],
  integration: ["create", "read", "update"],
  apiKey: ["read"],
  oauthApp: ["read"],
});

export const organizationMemberRole = organizationAccessControl.newRole({
  organization: ["read"],
  team: ["read"],
  member: ["read"],
  role: ["read"],
  client: ["read"],
  task: ["read"],
  project: ["read"],
  property: ["read"],
  calendar: ["read"],
  media: ["read"],
  visibility: ["read"],
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
