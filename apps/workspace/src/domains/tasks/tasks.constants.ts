import type { TaskPriority, TaskStatus } from "./tasks.types";

// ─── Ordered value arrays ──────────────────────────────────────────────────────

export const STATUSES: TaskStatus[] = [
  "todo",
  "inProgress",
  "waiting",
  "done",
  "canceled",
];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  waiting: "Waiting",
  done: "Done",
  canceled: "Canceled",
};

export const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  todo: "#6b7280",
  inProgress: "#3b82f6",
  waiting: "#f59e0b",
  done: "#22c55e",
  canceled: "#ef4444",
};

export const TASK_STAGES = STATUSES.map((status, order) => ({
  key: status,
  name: TASK_STATUS_LABEL[status],
  color: TASK_STATUS_COLOR[status],
  order,
}));

export const PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

export const ownershipFilters = ["all", "assignedToMe", "sentByMe"] as const;
export type OwnershipFilter = (typeof ownershipFilters)[number];

// ─── Status visual mapping ─────────────────────────────────────────────────────

export const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-[#A3A3A3]",
  inProgress: "bg-[var(--q-info)]",
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

export function normalizeTaskStatus(status: unknown): TaskStatus {
  if (status === "notStarted" || status === "not_started" || status === "not started") {
    return "todo";
  }
  if (status === "complete" || status === "completed") {
    return "done";
  }
  if (status === "cancelled") {
    return "canceled";
  }
  if (status === "todo" || status === "inProgress" || status === "waiting" || status === "done" || status === "canceled") {
    return status;
  }
  return "todo";
}

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
