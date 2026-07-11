import { normalizeTaskStatus } from "../../tasks/tasks.constants";
import type { TaskRecord } from "../../tasks/tasks.types";

export type WorkspaceTaskGroups = {
  active: TaskRecord[];
  today: TaskRecord[];
  overdue: TaskRecord[];
  waiting: TaskRecord[];
  assignedToMe: TaskRecord[];
  delegated: TaskRecord[];
  unscheduled: TaskRecord[];
};

const priorityRank: Record<TaskRecord["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function taskDueDateKey(dueDate?: string): string | null {
  if (!dueDate) return null;
  const key = dueDate.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
}

function sortByAttention(left: TaskRecord, right: TaskRecord): number {
  const leftDue = taskDueDateKey(left.dueDate) ?? "9999-12-31";
  const rightDue = taskDueDateKey(right.dueDate) ?? "9999-12-31";
  if (leftDue !== rightDue) return leftDue.localeCompare(rightDue);

  const priorityDifference = priorityRank[left.priority] - priorityRank[right.priority];
  if (priorityDifference !== 0) return priorityDifference;
  return right.updatedAt - left.updatedAt;
}

export function buildWorkspaceTaskGroups(
  tasks: TaskRecord[],
  userId: string,
  todayKey: string,
): WorkspaceTaskGroups {
  const active = tasks
    .filter((task) => {
      const status = normalizeTaskStatus(task.status);
      return !task._deleted && status !== "done" && status !== "canceled";
    })
    .sort(sortByAttention);

  return {
    active,
    today: active.filter((task) => taskDueDateKey(task.dueDate) === todayKey),
    overdue: active.filter((task) => {
      const dueDate = taskDueDateKey(task.dueDate);
      return dueDate !== null && dueDate < todayKey;
    }),
    waiting: active.filter((task) => normalizeTaskStatus(task.status) === "waiting"),
    assignedToMe: active.filter((task) => task.assigneeUserId === userId),
    delegated: active.filter(
      (task) => task.createdByUserId === userId && Boolean(task.assigneeUserId) && task.assigneeUserId !== userId,
    ),
    unscheduled: active.filter((task) => taskDueDateKey(task.dueDate) === null),
  };
}
