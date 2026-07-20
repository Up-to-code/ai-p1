import type { Id } from "@convex/_generated/dataModel";
import type { SavedViewConfig } from "@/domains/views";

export const TASK_VIEW_TYPES = [
  "table",
  "list",
  "board",
  "calendar",
  "timeline",
  "dashboard",
] as const;

export type TaskViewType = (typeof TASK_VIEW_TYPES)[number];

export type TaskWorkspaceSurfaceTab = {
  id: Id<"surfaceTabs">;
  label: string;
  icon?: string;
  order: number;
  canonicalRoute: string;
  savedView: {
    id: Id<"savedViews">;
    name: string;
    viewType: TaskViewType;
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

export type TaskWorkspaceSurfaceProjection = {
  surface: {
    id: Id<"surfaces">;
    key: string;
    title: string;
    canonicalRoute: string;
  };
  tabs: TaskWorkspaceSurfaceTab[];
  capabilities: { canCreateView: boolean };
};

export function isTaskViewType(value: string): value is TaskViewType {
  return TASK_VIEW_TYPES.includes(value as TaskViewType);
}

export function taskViewRoute(
  viewType: TaskViewType,
  savedViewId?: string,
) {
  const base = `/tasks/${viewType}`;
  return savedViewId ? `${base}/${savedViewId}` : base;
}

export function defaultTaskViewConfig(
  viewType: TaskViewType,
): SavedViewConfig {
  const common: SavedViewConfig = {
    sortBy: "updatedAt",
    sortDirection: "desc",
    density: "normal",
  };
  switch (viewType) {
    case "table":
      return { ...common, columnOrder: ["title", "status", "priority", "dueDate", "assigneeId"] };
    case "list":
      return { ...common, groupBy: "status" };
    case "board":
      return { ...common, groupBy: "status" };
    case "calendar":
      return { ...common };
    case "timeline":
      return { ...common };
    case "dashboard":
      return { ...common };
  }
}
