export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const AUTH_CODE_TTL_MS = 10 * 60 * 1000;

export const sandboxResourceTypes = ["organization", "client", "property", "project", "task", "calendar", "media"] as const;
export const sandboxActions = ["read", "create", "update", "delete"] as const;
export const sandboxScopes = sandboxResourceTypes.flatMap((resource) => sandboxActions.map((action) => `${resource}:${action}`));

export type SandboxResourceType = typeof sandboxResourceTypes[number];
export type SandboxAction = typeof sandboxActions[number];

export function scopeFor(resource: SandboxResourceType, action: SandboxAction) {
  return `${resource}:${action}`;
}

export function presentResource(resource: any) {
  return {
    id: resource._id,
    resourceType: resource.resourceType,
    data: resource.data,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
    deletedAt: resource.deletedAt ?? null,
  };
}
