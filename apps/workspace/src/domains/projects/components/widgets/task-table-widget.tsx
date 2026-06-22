"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDashboardContext } from "../dashboard-context";
import { useTasksQuery, updateTaskRequest } from "@/domains/tasks/api/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import type { TaskRecord } from "@/domains/tasks/tasks.types";

const statusColors: Record<string, { color: string; dot: string }> = {
  todo: { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-400" },
  inProgress: { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  waiting: { color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  done: { color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  canceled: { color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500", dot: "bg-gray-300" },
};

const priorityColors: Record<string, string> = {
  urgent: "text-red-500",
  high: "text-amber-500",
  normal: "text-muted-foreground",
  low: "text-muted-foreground/50",
};

const statusOrder: TaskRecord["status"][] = ["todo", "inProgress", "waiting", "done", "canceled"];

function formatDueDate(dateStr: string | undefined, t: (key: string, params?: Record<string, string | number>) => string): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateStr) return { text: "—", isOverdue: false, isToday: false };
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: t("dueLabels.overdue", { days: Math.abs(diffDays) }), isOverdue: true, isToday: false };
  if (diffDays === 0) return { text: t("dueLabels.today"), isOverdue: false, isToday: true };
  if (diffDays === 1) return { text: t("dueLabels.tomorrow"), isOverdue: false, isToday: false };
  if (diffDays <= 7) return { text: t("dueLabels.daysLeft", { days: diffDays }), isOverdue: false, isToday: false };
  return { text: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), isOverdue: false, isToday: false };
}

export function TaskTableWidget() {
  const t = useTranslations("Widgets.taskTable");
  const { projectId, organizationId } = useDashboardContext();
  const queryClient = useQueryClient();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const [showAddRow, setShowAddRow] = useState(false);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aIdx = statusOrder.indexOf(a.status);
      const bIdx = statusOrder.indexOf(b.status);
      if (aIdx !== bIdx) return aIdx - bIdx;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  const toggleDone = async (task: TaskRecord) => {
    const newStatus: TaskRecord["status"] = task.status === "done" ? "todo" : "done";
    try {
      await updateTaskRequest(organizationId, task.id, {
        title: task.title,
        status: newStatus,
        priority: task.priority,
        visibility: task.visibility ?? "team",
        assigneeUserId: task.assigneeUserId ?? "",
        projectId: task.projectId ?? "",
        clientId: task.clientId ?? "",
        dueDate: task.dueDate ?? "",
        description: task.description ?? "",
        tags: (task.tags ?? []).join(", "),
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const cycleStatus = async (task: TaskRecord) => {
    const currentIdx = statusOrder.indexOf(task.status);
    const nextIdx = (currentIdx + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIdx];
    try {
      await updateTaskRequest(organizationId, task.id, {
        title: task.title,
        status: newStatus,
        priority: task.priority,
        visibility: task.visibility ?? "team",
        assigneeUserId: task.assigneeUserId ?? "",
        projectId: task.projectId ?? "",
        clientId: task.clientId ?? "",
        dueDate: task.dueDate ?? "",
        description: task.description ?? "",
        tags: (task.tags ?? []).join(", "),
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Circle className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground/60">{t("noTasksYet")}</p>
        <p className="text-xs text-muted-foreground/40 mt-1">{t("addTasksHint")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="w-10 px-3 py-2.5" />
            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t("task")}</th>
            <th className="w-32 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t("status")}</th>
            <th className="w-28 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t("due")}</th>
            <th className="w-24 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t("priority")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            const isDone = task.status === "done";
            const due = formatDueDate(task.dueDate, t);
            const taskStatusColors = statusColors[task.status] ?? statusColors.todo;
            const priorityColor = priorityColors[task.priority] ?? priorityColors.normal;

            return (
              <tr
                key={task.id}
                className={cn(
                  "border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors group",
                  isDone && "opacity-50",
                )}
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleDone(task)}
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border transition-all",
                      isDone
                        ? "bg-primary border-primary text-white"
                        : "border-muted-foreground/30 hover:border-muted-foreground/60",
                    )}
                  >
                    {isDone && <Check className="h-3 w-3" />}
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("font-medium text-foreground", isDone && "line-through text-muted-foreground")}>
                    {task.title}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => cycleStatus(task)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80",
                      taskStatusColors.color,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", taskStatusColors.dot)} />
                    {t(`statusLabels.${task.status}`)}
                  </button>
                </td>
                <td className={cn(
                  "px-3 py-2.5 text-xs font-medium",
                  due.isOverdue ? "text-red-500" : due.isToday ? "text-amber-500" : "text-muted-foreground",
                )}>
                  {due.text}
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", priorityColor)}>
                    {t(`priorityLabels.${task.priority}`)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
