import { z } from "zod/v4";

export const COMMON_PERMISSION_GROUPS = [
  {
    id: "identity",
    title: "Identity",
    description: "Read basic organization and user identity after consent.",
    scopes: [
      { value: "organization:read", label: "Read organization profile" },
    ],
  },
  {
    id: "workspace",
    title: "Workspace data",
    description: "Access organization records required by the app workflow.",
    scopes: [
      { value: "client:read", label: "Read clients" },
      { value: "property:read", label: "Read properties" },
      { value: "project:read", label: "Read projects" },
      { value: "calendar:read", label: "Read calendar" },
      { value: "task:read", label: "Read tasks" },
      { value: "media:read", label: "Read media" },
    ],
  },
  {
    id: "write",
    title: "Safe workspace writes",
    description: "Request create or update scopes only for workflows that write back to Workspace.",
    scopes: [
      { value: "client:create", label: "Create clients" },
      { value: "client:update", label: "Update clients" },
    ],
  },
] as const;

const scopePattern = /^[a-z][a-z0-9:_-]*$/u;

export function parseManualScopes(value: string) {
  return value
    .split(/[\n, ]+/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function mergeCheckpointScopes(selectedScopes: string[], manualScopes: string) {
  return [...new Set([...selectedScopes, ...parseManualScopes(manualScopes)])].sort();
}

export const accessCheckpointScopesSchema = z
  .array(z.string().regex(scopePattern, "Use lowercase scope names like client:read."))
  .min(1, "Select at least one permission checkpoint.")
  .refine((scopes) => scopes.every((scope) => !scope.endsWith(":delete")), {
    message: "Delete scopes require admin approval and are not available in self-serve app setup.",
  });
