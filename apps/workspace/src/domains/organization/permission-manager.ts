import type { PermissionResource } from "./settings-view-model";

export type PermissionActions<TResource extends string, TAction extends string> = {
  resource: TResource;
  actions: TAction[];
};

export function clonePermissions<TResource extends string, TAction extends string>(
  permissions: Array<PermissionActions<TResource, TAction>>,
): Array<PermissionActions<TResource, TAction>> {
  return permissions.map((permission) => ({
    resource: permission.resource,
    actions: [...permission.actions],
  }));
}

export function permissionActions<TResource extends string, TAction extends string>(
  permissions: Array<PermissionActions<TResource, TAction>>,
  resource: TResource,
): TAction[] {
  return permissions.find((permission) => permission.resource === resource)?.actions ?? [];
}

export function permissionSummary<TResource extends string, TAction extends string>(
  permissions: Array<PermissionActions<TResource, TAction>>,
  labels: {
    resource: (resource: TResource) => string;
    action: (action: TAction) => string;
  },
  options?: { excludeResources?: TResource[] },
) {
  return permissions
    .filter((permission) => !options?.excludeResources?.includes(permission.resource))
    .map((permission) => `${labels.resource(permission.resource)}: ${permission.actions.map(labels.action).join(", ")}`)
    .join(" • ");
}

export function clampPermissionsToGrantable<TResource extends string, TAction extends string>(
  permissions: Array<PermissionActions<TResource, TAction>>,
  grantable: Array<PermissionActions<TResource, TAction>>,
): Array<PermissionActions<TResource, TAction>> {
  return permissions
    .map((permission) => {
      const allowed = permissionActions(grantable, permission.resource);
      return {
        resource: permission.resource,
        actions: permission.actions.filter((action) => allowed.includes(action)),
      };
    })
    .filter((permission) => permission.actions.length > 0);
}

export function togglePermission<TResource extends string, TAction extends string>(
  current: Array<PermissionActions<TResource, TAction>>,
  grantable: Array<PermissionActions<TResource, TAction>>,
  resource: TResource,
  action: TAction,
): Array<PermissionActions<TResource, TAction>> {
  if (!permissionActions(grantable, resource).includes(action)) return current;
  const existing = current.find((permission) => permission.resource === resource);
  const nextActions = existing?.actions.includes(action)
    ? existing.actions.filter((item) => item !== action)
    : [...(existing?.actions ?? []), action];
  const without = current.filter((permission) => permission.resource !== resource);
  if (nextActions.length === 0) return without;
  return [...without, { resource, actions: nextActions }];
}

export function toggleRolePermissionAction(
  current: Partial<Record<PermissionResource, string[]>>,
  resource: PermissionResource,
  action: string,
): Partial<Record<PermissionResource, string[]>> {
  const currentActions = current[resource] ?? [];
  const nextActions = currentActions.includes(action)
    ? currentActions.filter((item) => item !== action)
    : [...currentActions, action];

  return { ...current, [resource]: nextActions };
}
