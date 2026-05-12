export const ORGANIZATION_API_KEY_RESOURCES = ["clients", "properties", "deals", "brokers"] as const;
export const ORGANIZATION_API_KEY_ACTIONS = ["read", "create", "update", "delete"] as const;

export type OrganizationApiKeyResource = (typeof ORGANIZATION_API_KEY_RESOURCES)[number];
export type OrganizationApiKeyAction = (typeof ORGANIZATION_API_KEY_ACTIONS)[number];
export type OrganizationApiKeyPermission = {
  resource: OrganizationApiKeyResource;
  action: OrganizationApiKeyAction;
};

export const ORGANIZATION_API_KEY_RESOURCE_CATALOG = [
  { resource: "clients", label: "Clients", arabicLabel: "العملاء" },
  { resource: "properties", label: "Properties", arabicLabel: "العقارات" },
  { resource: "deals", label: "Deals", arabicLabel: "الصفقات" },
  { resource: "brokers", label: "Brokers", arabicLabel: "الوسطاء" },
] as const satisfies ReadonlyArray<{
  resource: OrganizationApiKeyResource;
  label: string;
  arabicLabel: string;
}>;

export const ORGANIZATION_API_KEY_ACTION_CATALOG = [
  { action: "read", label: "Read", arabicLabel: "قراءة" },
  { action: "create", label: "Create", arabicLabel: "إنشاء" },
  { action: "update", label: "Update", arabicLabel: "تحديث" },
  { action: "delete", label: "Delete", arabicLabel: "حذف" },
] as const satisfies ReadonlyArray<{
  action: OrganizationApiKeyAction;
  label: string;
  arabicLabel: string;
}>;

export const ORGANIZATION_API_KEY_ALLOWED_PERMISSIONS = [
  { resource: "clients", action: "read" },
  { resource: "clients", action: "create" },
  { resource: "clients", action: "update" },
  { resource: "clients", action: "delete" },
  { resource: "properties", action: "read" },
  { resource: "properties", action: "create" },
  { resource: "properties", action: "update" },
  { resource: "properties", action: "delete" },
  { resource: "deals", action: "read" },
  { resource: "deals", action: "create" },
  { resource: "deals", action: "update" },
  { resource: "deals", action: "delete" },
  { resource: "brokers", action: "read" },
] as const satisfies readonly OrganizationApiKeyPermission[];

const allowedPermissionKeySet = new Set(
  ORGANIZATION_API_KEY_ALLOWED_PERMISSIONS.map((permission) => `${permission.resource}:${permission.action}`),
);

export function isOrganizationApiKeyPermissionAllowed(permission: OrganizationApiKeyPermission) {
  return allowedPermissionKeySet.has(`${permission.resource}:${permission.action}`);
}

export function listOrganizationApiKeyAllowedActions(resource: OrganizationApiKeyResource) {
  return ORGANIZATION_API_KEY_ALLOWED_PERMISSIONS
    .filter((permission) => permission.resource === resource)
    .map((permission) => permission.action);
}
