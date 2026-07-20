import type { Doc } from "../_generated/dataModel";
import type { SurfaceConfig } from "../workspaceSurfaces/helpers";

export const PROJECT_WORKSPACE_SURFACE_KEY = "workspace:projects";

export type ProjectWorkspaceViewType =
  | "table"
  | "list"
  | "board"
  | "calendar"
  | "timeline"
  | "dashboard";

export function isProjectWorkspaceViewType(
  value: Doc<"savedViews">["viewType"],
): value is ProjectWorkspaceViewType {
  return value !== "fileManager";
}

export function canonicalProjectWorkspaceRoute(
  viewType: ProjectWorkspaceViewType,
  savedViewId?: string,
) {
  const base = `/projects/${viewType}`;
  return savedViewId ? `${base}/${savedViewId}` : base;
}

export const PROJECT_WORKSPACE_SURFACE_CONFIG: SurfaceConfig = {
  key: PROJECT_WORKSPACE_SURFACE_KEY,
  resourceType: "project",
  canonicalRoute: "/projects/table",
  viewTypeGuard: isProjectWorkspaceViewType,
  buildRoute: (viewType, savedViewId) =>
    canonicalProjectWorkspaceRoute(viewType as ProjectWorkspaceViewType, savedViewId),
};
