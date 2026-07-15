import type { Id } from "@convex/_generated/dataModel";
import type { SavedViewConfig } from "@/domains/views";

export const PROJECT_VIEW_TYPES = [
  "table",
  "list",
  "board",
  "calendar",
  "timeline",
  "dashboard",
] as const;

export type ProjectViewType = (typeof PROJECT_VIEW_TYPES)[number];

export type ProjectWorkspaceSurfaceTab = {
  id: Id<"surfaceTabs">;
  label: string;
  icon?: string;
  order: number;
  canonicalRoute: string;
  savedView: {
    id: Id<"savedViews">;
    name: string;
    viewType: ProjectViewType;
    config: SavedViewConfig;
    sharingMode: "personal" | "shared" | "protected";
    revision: number;
    isSystemDefault: boolean;
  };
  capabilities: {
    canRename: boolean;
    canReorder: boolean;
    canDuplicate: boolean;
    canShare: boolean;
    canRemove: boolean;
  };
};

export type ProjectWorkspaceSurfaceProjection = {
  surface: {
    id: Id<"surfaces">;
    key: string;
    title: string;
    canonicalRoute: string;
  };
  tabs: ProjectWorkspaceSurfaceTab[];
  capabilities: { canCreateView: boolean };
};

export function isProjectViewType(value: string): value is ProjectViewType {
  return PROJECT_VIEW_TYPES.includes(value as ProjectViewType);
}

export function projectViewRoute(
  viewType: ProjectViewType,
  savedViewId?: string,
) {
  const base = `/projects/${viewType}`;
  return savedViewId ? `${base}/${savedViewId}` : base;
}

export function defaultProjectViewConfig(
  viewType: ProjectViewType,
): SavedViewConfig {
  const common: SavedViewConfig = {
    sortBy: "updatedAt",
    sortDirection: "desc",
    density: "normal",
  };
  switch (viewType) {
    case "table":
      return {
        ...common,
        columnOrder: ["name", "status", "health", "progress", "startDate", "endDate"],
        project: { visibleFields: ["name", "status", "health", "progress", "startDate", "endDate"] },
      };
    case "list":
      return { ...common, groupBy: "status", project: { visibleFields: ["name", "health", "progress", "endDate"] } };
    case "board":
      return { ...common, groupBy: "status", sortBy: "updatedAt" };
    case "calendar":
      return { ...common, project: { calendarScale: "week", calendarColorBy: "status", showUnscheduled: true } };
    case "timeline":
      return { ...common, project: { timelineScale: "week", showUnscheduled: true } };
    case "dashboard":
      return { ...common, project: { dashboardWidgets: [] } };
  }
}
