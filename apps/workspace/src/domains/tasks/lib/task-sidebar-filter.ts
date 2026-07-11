import type { TaskRecord } from "../tasks.types";

export type TaskSidebarFilter =
  | "all"
  | "my"
  | "assigned"
  | "unassigned"
  | "today"
  | "upcoming"
  | "completed"
  | "overdue"
  | "high-priority";

export function filterTasksForSidebar(
  tasks: TaskRecord[],
  filter: string,
  currentUserId: string,
  now = new Date(),
): TaskRecord[] {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;

  return tasks.filter((task) => {
    if (task._deleted) return false;
    const dueAt = task.dueDate ? new Date(task.dueDate).getTime() : Number.NaN;

    switch (filter as TaskSidebarFilter) {
      case "my":
        return task.assigneeUserId === currentUserId || task.assigneeUserIds?.includes(currentUserId) === true;
      case "assigned":
        return task.createdByUserId === currentUserId && task.assigneeUserId !== currentUserId && !task.assigneeUserIds?.includes(currentUserId);
      case "unassigned":
        return !task.assigneeUserId && !task.assigneeUserIds?.length;
      case "today":
        return dueAt >= todayStart && dueAt < tomorrowStart && task.status !== "done";
      case "upcoming":
        return dueAt >= tomorrowStart && task.status !== "done";
      case "completed":
        return task.status === "done";
      case "overdue":
        return dueAt < todayStart && task.status !== "done";
      case "high-priority":
        return task.priority === "urgent" || task.priority === "high";
      default:
        return true;
    }
  });
}
