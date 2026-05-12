import type { WorkspaceStatus } from "@/domains/auth/workspace-status";

export type QueryDebugMetadata = {
  resourceType: string;
  resourceId?: string | null;
  organizationId?: string | null;
  workspaceStatus?: WorkspaceStatus | string;
  isConvexAuthPending?: boolean;
  isConvexAuthenticated?: boolean;
  path?: string | null;
  queryKey?: string | null;
};

export type QueryDebugDetail = {
  label: string;
  value: string;
};

function safeValue(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  return "missing";
}

export function normalizeQueryDebugDetails(
  metadata: QueryDebugMetadata,
  options?: { timedOut?: boolean },
): QueryDebugDetail[] {
  const details = [
    { label: "resource", value: safeValue(metadata.resourceType) },
    { label: "resourceId", value: safeValue(metadata.resourceId) },
    { label: "organizationId", value: safeValue(metadata.organizationId) },
    { label: "workspaceStatus", value: safeValue(metadata.workspaceStatus) },
    { label: "convexAuthPending", value: safeValue(metadata.isConvexAuthPending) },
    { label: "convexAuthenticated", value: safeValue(metadata.isConvexAuthenticated) },
    { label: "timedOut", value: safeValue(options?.timedOut ?? false) },
  ];

  if (metadata.path) details.push({ label: "path", value: safeValue(metadata.path) });
  if (metadata.queryKey) details.push({ label: "queryKey", value: safeValue(metadata.queryKey) });

  return details;
}
