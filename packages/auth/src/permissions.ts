export const organizationPermissionStatement = {
  organization: ["read", "update", "delete"],
  team: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  visibility: ["read", "update"],
  integration: ["create", "read", "update", "delete"],
  apiKey: ["create", "read", "update", "delete"],
  oauthApp: ["create", "read", "update", "delete", "authorize"],
} as const;

export type OrganizationPermissionStatement =
  typeof organizationPermissionStatement;

type PermissionMap = Partial<Record<keyof OrganizationPermissionStatement, readonly string[]>>;

function role(statements: PermissionMap) {
  return {
    statements,
    authorize: (request: PermissionMap) => ({
      success: Object.entries(request).every(([resource, actions]) => {
        const allowed = statements[resource as keyof OrganizationPermissionStatement] ?? [];
        return (actions ?? []).every((action) => allowed.includes(action));
      }),
    }),
  };
}

const allStatements = Object.fromEntries(
  Object.entries(organizationPermissionStatement).map(([resource, actions]) => [resource, [...actions]]),
) as PermissionMap;

const adminStatements = {
  organization: ["read"],
  member: ["create", "read", "update"],
  role: ["read"],
  client: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  calendar: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  integration: ["read", "update"],
  apiKey: ["read"],
  oauthApp: ["read"],
} satisfies PermissionMap;

const memberStatements = {
  organization: ["read"],
  team: ["read"],
  member: ["read"],
  role: ["read"],
  client: ["read"],
  task: ["read"],
  project: ["read"],
  calendar: ["read"],
  media: ["read"],
  integration: ["read"],
} satisfies PermissionMap;

export const organizationAccessControl = {
  newRole: role,
};

const organizationOwnerRole = role(allStatements);
const organizationAdminRole = role(adminStatements);
const organizationMemberRole = role(memberStatements);

export const organizationRoles = {
  owner: organizationOwnerRole,
  admin: organizationAdminRole,
  member: organizationMemberRole,
};
