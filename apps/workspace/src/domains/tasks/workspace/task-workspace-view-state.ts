import type { SavedViewConfig } from "../api/saved-views";
import type { TaskSidebarFilter } from "../lib/task-sidebar-filter";
import { filterTasksForSidebar } from "../lib/task-sidebar-filter";
import type { TaskRecord } from "../tasks.types";

export const taskWorkspaceFilters = [
  "all", "my", "assigned", "unassigned", "today", "upcoming",
  "completed", "overdue", "high-priority",
] as const satisfies readonly TaskSidebarFilter[];

export type TaskWorkspaceGroup = "none" | "status" | "priority";
export type TaskWorkspaceSort = "updatedAt" | "title" | "dueDate" | "priority";
export type TaskWorkspaceDirection = "asc" | "desc";

export interface TaskWorkspaceViewState {
  filter: TaskSidebarFilter;
  groupBy: TaskWorkspaceGroup;
  sortBy: TaskWorkspaceSort;
  sortDirection: TaskWorkspaceDirection;
  density: "compact" | "normal";
  search: string;
  columnOrder: string[];
  columnWidths: Record<string, number>;
  columnVisibility: Record<string, boolean>;
}

export const defaultTaskWorkspaceViewState: TaskWorkspaceViewState = {
  filter: "all",
  groupBy: "none",
  sortBy: "updatedAt",
  sortDirection: "desc",
  density: "compact",
  search: "",
  columnOrder: [],
  columnWidths: {},
  columnVisibility: {},
};

type SearchParamsReader = Pick<URLSearchParams, "get">;

function oneOf<T extends string>(value: string | null, values: readonly T[], fallback: T): T {
  return value && values.includes(value as T) ? (value as T) : fallback;
}

function columnIds(value: string | null): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").filter((id) => /^[a-zA-Z0-9_-]{1,64}$/.test(id)))].slice(0, 64);
}

function parseColumnWidths(value: string | null): Record<string, number> {
  if (!value) return {};
  const entries = value.split(",").slice(0, 64).flatMap((item) => {
    const [id, rawWidth] = item.split(":");
    const width = Number(rawWidth);
    return id && /^[a-zA-Z0-9_-]{1,64}$/.test(id) && Number.isFinite(width)
      ? [[id, Math.min(1200, Math.max(48, Math.round(width)))] as const]
      : [];
  });
  return Object.fromEntries(entries);
}

function parseColumnVisibility(value: string | null): Record<string, boolean> {
  if (!value) return {};
  return Object.fromEntries(value.split(",").slice(0, 64).flatMap((item) => {
    const [id, visible] = item.split(":");
    return id && /^[a-zA-Z0-9_-]{1,64}$/.test(id) && (visible === "0" || visible === "1")
      ? [[id, visible === "1"] as const]
      : [];
  }));
}

/** Parses untrusted route state into the one canonical Task view contract. */
export function parseTaskWorkspaceViewState(params: SearchParamsReader): TaskWorkspaceViewState {
  return {
    filter: oneOf(params.get("filter"), taskWorkspaceFilters, "all"),
    groupBy: oneOf(params.get("group"), ["none", "status", "priority"] as const, "none"),
    sortBy: oneOf(params.get("sort"), ["updatedAt", "title", "dueDate", "priority"] as const, "updatedAt"),
    sortDirection: oneOf(params.get("direction"), ["asc", "desc"] as const, "desc"),
    density: oneOf(params.get("density"), ["compact", "normal"] as const, "compact"),
    search: params.get("search")?.trim().slice(0, 200) ?? "",
    columnOrder: columnIds(params.get("columns")),
    columnWidths: parseColumnWidths(params.get("widths")),
    columnVisibility: params.get("visibility")
      ? parseColumnVisibility(params.get("visibility"))
      : Object.fromEntries(columnIds(params.get("hidden")).map((id) => [id, false])),
  };
}

/** Serializes non-default state while preserving unrelated route parameters. */
export function writeTaskWorkspaceViewState(
  current: URLSearchParams,
  state: TaskWorkspaceViewState,
): URLSearchParams {
  const next = new URLSearchParams(current);
  const values: Array<[string, string, string]> = [
    ["filter", state.filter, "all"],
    ["group", state.groupBy, "none"],
    ["sort", state.sortBy, "updatedAt"],
    ["direction", state.sortDirection, "desc"],
    ["density", state.density, "compact"],
    ["search", state.search.trim(), ""],
    ["columns", state.columnOrder.join(","), ""],
    ["widths", Object.entries(state.columnWidths).map(([id, width]) => `${id}:${Math.round(width)}`).join(","), ""],
    ["visibility", Object.entries(state.columnVisibility).map(([id, visible]) => `${id}:${visible ? 1 : 0}`).join(","), ""],
  ];
  for (const [key, value, fallback] of values) {
    if (value === fallback) next.delete(key);
    else next.set(key, value);
  }
  return next;
}

/**
 * Resolves a canonical Task workspace URL only when route state actually
 * changes. Returning `null` keeps controlled views from turning repeated
 * component state reports into redundant Next.js navigations.
 */
export function resolveTaskWorkspaceViewHref(
  pathname: string,
  current: URLSearchParams,
  state: TaskWorkspaceViewState,
): string | null {
  const next = writeTaskWorkspaceViewState(current, state);
  if (next.toString() === current.toString()) return null;
  return next.size ? `${pathname}?${next}` : pathname;
}

export function taskWorkspaceStateToSavedView(state: TaskWorkspaceViewState): SavedViewConfig {
  return {
    groupBy: state.groupBy,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    density: state.density,
    search: state.search || undefined,
    filters: state.filter === "all"
      ? []
      : [{ field: "workspace", operator: "equals", value: state.filter }],
    columnOrder: state.columnOrder,
    columnWidths: state.columnWidths,
    columnVisibility: state.columnVisibility,
  };
}

export function taskWorkspaceStateFromSavedView(
  config: SavedViewConfig,
  fallback: TaskWorkspaceViewState = defaultTaskWorkspaceViewState,
): TaskWorkspaceViewState {
  const workspaceFilter = config.filters?.find((filter) => filter.field === "workspace")?.value;
  const params = new URLSearchParams();
  if (typeof workspaceFilter === "string") params.set("filter", workspaceFilter);
  if (config.groupBy) params.set("group", config.groupBy);
  if (config.sortBy) params.set("sort", config.sortBy);
  if (config.sortDirection) params.set("direction", config.sortDirection);
  if (config.density) params.set("density", config.density);
  if (config.search) params.set("search", config.search);
  if (config.columnOrder?.length) params.set("columns", config.columnOrder.join(","));
  if (config.columnWidths) params.set("widths", Object.entries(config.columnWidths).map(([id, width]) => `${id}:${width}`).join(","));
  if (config.columnVisibility) params.set("visibility", Object.entries(config.columnVisibility).map(([id, visible]) => `${id}:${visible ? 1 : 0}`).join(","));
  return { ...fallback, ...parseTaskWorkspaceViewState(params) };
}

/** Applies record-selection state shared by table, board, and list adapters. */
export function selectTaskWorkspaceRecords(
  tasks: TaskRecord[],
  state: TaskWorkspaceViewState,
  currentUserId: string,
): TaskRecord[] {
  const scoped = filterTasksForSidebar(tasks, state.filter, currentUserId);
  const search = state.search.toLocaleLowerCase();
  if (!search) return scoped;
  return scoped.filter((task) =>
    [task.title, task.description, ...(task.tags ?? [])]
      .some((value) => value?.toLocaleLowerCase().includes(search)),
  );
}
