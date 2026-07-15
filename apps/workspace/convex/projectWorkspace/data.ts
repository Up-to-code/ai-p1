import type { Doc } from "../_generated/dataModel";

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
