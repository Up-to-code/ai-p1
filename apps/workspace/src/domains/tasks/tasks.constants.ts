import type { TaskPriority, TaskStatus } from "./tasks.types";

// ─── Ordered value arrays ──────────────────────────────────────────────────────

export const STATUSES: TaskStatus[] = [
  "todo",
  "inProgress",
  "waiting",
  "done",
  "canceled",
];

export const PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

export const ownershipFilters = ["all", "assignedToMe", "sentByMe"] as const;
export type OwnershipFilter = (typeof ownershipFilters)[number];

// ─── Status visual mapping ─────────────────────────────────────────────────────

export const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-[#A3A3A3]",
  inProgress: "bg-[#3B82F6]",
  waiting: "bg-[#F59E0B]",
  done: "bg-[#10B981]",
  canceled: "bg-[#6B6B6B]",
};

export const STATUS_COLUMN_BG: Record<TaskStatus, string> = {
  todo: "bg-muted/30",
  inProgress: "bg-blue-500/5 dark:bg-blue-500/10",
  waiting: "bg-amber-500/5 dark:bg-amber-500/10",
  done: "bg-emerald-500/5 dark:bg-emerald-500/10",
  canceled: "bg-muted/30",
};

// ─── Priority visual mapping ───────────────────────────────────────────────────

export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "text-text-muted",
  normal: "text-text-muted",
  high: "text-amber-500",
  urgent: "text-red-500",
};

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_FORM_VALUES = {
  title: "",
  status: "todo" as const,
  priority: "normal" as const,
  visibility: "team" as const,
  assigneeUserId: "",
  clientId: "",
  projectId: "",
  dueDate: "",
  description: "",
  tags: "",
};

export const emptyTask: typeof DEFAULT_FORM_VALUES = {
  ...DEFAULT_FORM_VALUES,
  title: "Untitled task",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getDueDateColor(dueDate?: string | null) {
  if (!dueDate) return "text-muted-foreground";
  const dateStr = dueDate.length === 10 ? dueDate : dueDate.slice(0, 10);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr < todayStr) return "text-red-500";
  if (dateStr === todayStr) return "text-amber-500";
  return "text-muted-foreground";
}

export function getInitials(name?: string) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

export function removePendingTaskPatch<TPatch>(
  patches: Record<string, TPatch>,
  taskId: string,
) {
  return Object.fromEntries(
    Object.entries(patches).filter(([id]) => id !== taskId),
  ) as Record<string, TPatch>;
}

// ─── Document context type ─────────────────────────────────────────────────────

export type TaskDocumentContext =
  | { scope: "global"; organizationId: string }
  | { scope: "project"; organizationId: string; projectId: string };

export function taskDocumentContext(
  organizationId: string,
  routeProjectId?: string | null,
  taskProjectId?: string | null,
): TaskDocumentContext {
  const projectId = routeProjectId || taskProjectId || "";
  return projectId
    ? { scope: "project", organizationId, projectId }
    : { scope: "global", organizationId };
}
