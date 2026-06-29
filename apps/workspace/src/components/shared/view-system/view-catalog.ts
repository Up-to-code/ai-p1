/**
 * View catalog — single source of truth for the shareable view system.
 *
 * Each entry describes a view type the user can add to any domain's
 * page-level tab bar (projects, deals, clients, etc.). The component
 * receives this catalog (or a subset) via props and renders the tabs.
 *
 * Icon files live in `/public/icons/clickup/` and use `currentColor`,
 * so they pick up the parent element's `color` style when rendered
 * via `mask-image` (see `view-icon.tsx`).
 */

export type ViewType =
  | "dashboard"
  | "list"
  | "board"
  | "table"
  | "calendar"
  | "timeline"
  | "activity"
  | "map"
  | "doc"
  | "form"
  | "workload"
  | "team"
  | "mindmap"
  | "whiteboard"
  | "website"
  | "sheets";

export type ViewGroup = "popular" | "more" | "embed";

export interface ViewMeta {
  type: ViewType;
  label: string;
  description: string;
  /** Path under `/public` (e.g. `/icons/clickup/table.svg`) */
  iconPath: string;
  /** CSS color (theme token, hex, or rgb). Applied as background to a mask. */
  color: string;
  group: ViewGroup;
}

export const DEFAULT_VIEW_CATALOG: readonly ViewMeta[] = [
  { type: "list",       label: "List",            description: "Track tasks, bugs, people & more",           iconPath: "/icons/clickup/list.svg",          color: "var(--q-text-primary)", group: "popular" },
  { type: "calendar",   label: "Calendar",        description: "Plan, schedule, & delegate",                 iconPath: "/icons/clickup/calendar.svg",      color: "var(--q-warning)",      group: "popular" },
  { type: "board",      label: "Board – Kanban",  description: "Move tasks between columns",                 iconPath: "/icons/clickup/kanban.svg",        color: "var(--q-agent-purple)", group: "popular" },
  { type: "doc",        label: "Doc",             description: "Collaborate & document anything",            iconPath: "/icons/clickup/file-text.svg",      color: "var(--q-info)",         group: "popular" },
  { type: "form",       label: "Form",            description: "Collect, track, & report data",              iconPath: "/icons/clickup/clipboard-check.svg", color: "var(--q-error)",       group: "popular" },
  { type: "dashboard",  label: "Box",             description: "Track metrics & insights",                   iconPath: "/icons/clickup/home.svg",          color: "var(--q-info)",         group: "popular" },
  { type: "table",      label: "Table",           description: "Structured table format",                    iconPath: "/icons/clickup/table.svg",         color: "var(--q-success)",      group: "more" },
  { type: "whiteboard", label: "Whiteboard",      description: "Visualize & brainstorm",                     iconPath: "/icons/clickup/expand-arrows.svg", color: "var(--q-warning)",      group: "more" },
  { type: "timeline",   label: "Timeline",        description: "See tasks by start & due date",              iconPath: "/icons/clickup/clock.svg",         color: "var(--q-warning)",      group: "more" },
  { type: "activity",   label: "Activity",        description: "Real-time activity feed",                    iconPath: "/icons/clickup/activity.svg",      color: "var(--q-data-cyan)",    group: "more" },
  { type: "workload",   label: "Workload",        description: "Visualize team capacity",                    iconPath: "/icons/clickup/bar-chart.svg",    color: "var(--q-data-cyan)",    group: "more" },
  { type: "mindmap",    label: "Mind Map",        description: "Visual brainstorming of ideas",              iconPath: "/icons/clickup/ai-sparkle.svg",    color: "var(--q-agent-purple)", group: "more" },
  { type: "team",       label: "Team",            description: "Monitor work being done",                    iconPath: "/icons/clickup/user-plus.svg",     color: "var(--q-agent-purple)", group: "more" },
  { type: "map",        label: "Map",             description: "Tasks visualized by address",               iconPath: "/icons/clickup/menu.svg",          color: "var(--q-error)",        group: "more" },
  { type: "website",    label: "Any website",     description: "Embed any page or tool",                     iconPath: "/icons/clickup/link.svg",          color: "var(--q-text-primary)", group: "embed" },
  { type: "sheets",     label: "Google Sheets",   description: "Connect your spreadsheet",                   iconPath: "/icons/clickup/table.svg",         color: "var(--q-success)",      group: "embed" },
] as const;

const CATALOG_BY_TYPE = new Map<ViewType, ViewMeta>(
  DEFAULT_VIEW_CATALOG.map((m) => [m.type, m]),
);

export function getViewMeta(
  type: ViewType | string,
  catalog: readonly ViewMeta[] = DEFAULT_VIEW_CATALOG,
): ViewMeta | undefined {
  if (catalog === DEFAULT_VIEW_CATALOG) {
    return CATALOG_BY_TYPE.get(type as ViewType);
  }
  return catalog.find((m) => m.type === type);
}
