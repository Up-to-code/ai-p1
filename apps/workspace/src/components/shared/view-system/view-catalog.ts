import { workspaceAssets } from "@/lib/assets/workspace-assets";

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
  { type: "list",       label: "List",            description: "Track tasks, bugs, people & more",           iconPath: workspaceAssets.viewIcons.list,          color: "var(--q-text-primary)", group: "popular" },
  { type: "calendar",   label: "Calendar",        description: "Plan, schedule, & delegate",                 iconPath: workspaceAssets.viewIcons.calendar,      color: "var(--q-warning)",      group: "popular" },
  { type: "board",      label: "Board – Kanban",  description: "Move tasks between columns",                 iconPath: workspaceAssets.viewIcons.board,        color: "var(--q-agent-purple)", group: "popular" },
  { type: "doc",        label: "Doc",             description: "Collaborate & document anything",            iconPath: workspaceAssets.viewIcons.document,      color: "var(--q-info)",         group: "popular" },
  { type: "form",       label: "Form",            description: "Collect, track, & report data",              iconPath: workspaceAssets.viewIcons.form, color: "var(--q-error)",       group: "popular" },
  { type: "dashboard",  label: "Box",             description: "Track metrics & insights",                   iconPath: workspaceAssets.viewIcons.dashboard,          color: "var(--q-info)",         group: "popular" },
  { type: "table",      label: "Table",           description: "Structured table format",                    iconPath: workspaceAssets.viewIcons.table,         color: "var(--q-success)",      group: "more" },
  { type: "whiteboard", label: "Whiteboard",      description: "Visualize & brainstorm",                     iconPath: workspaceAssets.viewIcons.expand, color: "var(--q-warning)",      group: "more" },
  { type: "timeline",   label: "Timeline",        description: "See tasks by start & due date",              iconPath: workspaceAssets.viewIcons.timeline,         color: "var(--q-warning)",      group: "more" },
  { type: "activity",   label: "Activity",        description: "Real-time activity feed",                    iconPath: workspaceAssets.viewIcons.activity,      color: "var(--q-data-cyan)",    group: "more" },
  { type: "workload",   label: "Workload",        description: "Visualize team capacity",                    iconPath: workspaceAssets.viewIcons.chart,    color: "var(--q-data-cyan)",    group: "more" },
  { type: "mindmap",    label: "Mind Map",        description: "Visual brainstorming of ideas",              iconPath: workspaceAssets.viewIcons.ai,    color: "var(--q-agent-purple)", group: "more" },
  { type: "team",       label: "Team",            description: "Monitor work being done",                    iconPath: workspaceAssets.viewIcons.team,     color: "var(--q-agent-purple)", group: "more" },
  { type: "map",        label: "Map",             description: "Tasks visualized by address",               iconPath: workspaceAssets.viewIcons.menu,          color: "var(--q-error)",        group: "more" },
  { type: "website",    label: "Any website",     description: "Embed any page or tool",                     iconPath: workspaceAssets.viewIcons.link,          color: "var(--q-text-primary)", group: "embed" },
  { type: "sheets",     label: "Google Sheets",   description: "Connect your spreadsheet",                   iconPath: workspaceAssets.viewIcons.table,         color: "var(--q-success)",      group: "embed" },
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
