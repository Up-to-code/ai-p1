import type { Doc } from "../_generated/dataModel";
import type { SurfaceConfig } from "../workspaceSurfaces/helpers";

export const TASK_WORKSPACE_SURFACE_KEY = "workspace:tasks";

export type TaskWorkspaceViewType =
  | "table"
  | "list"
  | "board"
  | "calendar"
  | "timeline"
  | "dashboard";

export function isTaskWorkspaceViewType(
  value: Doc<"savedViews">["viewType"],
): value is TaskWorkspaceViewType {
  return value !== "fileManager";
}

export function canonicalTaskWorkspaceRoute(
  viewType: TaskWorkspaceViewType,
  savedViewId?: string,
) {
  const base = `/tasks/${viewType}`;
  return savedViewId ? `${base}/${savedViewId}` : base;
}

export const TASK_WORKSPACE_SURFACE_CONFIG: SurfaceConfig = {
  key: TASK_WORKSPACE_SURFACE_KEY,
  resourceType: "task",
  canonicalRoute: "/tasks/table",
  viewTypeGuard: isTaskWorkspaceViewType,
  buildRoute: (viewType, savedViewId) =>
    canonicalTaskWorkspaceRoute(viewType as TaskWorkspaceViewType, savedViewId),
};
