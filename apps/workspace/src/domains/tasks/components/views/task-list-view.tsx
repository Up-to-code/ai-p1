"use client";

import { useMemo } from "react";
import { Calendar, Circle, CheckCircle2, Flag, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskRecord, TaskStatus } from "../../tasks.types";
import { PRIORITY_COLOR, STATUSES, STATUS_DOT, TASK_STATUS_LABEL, getDueDateColor, normalizeTaskStatus } from "../../tasks.constants";
import { sortPipelineTasks } from "../../task-pipeline-order";

type TaskListViewProps = {
  tasks: TaskRecord[];
  statusFilter?: TaskStatus | "all";
};

export function TaskListView({ tasks, statusFilter = "all" }: TaskListViewProps) {
  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, TaskRecord[]> = {
      todo: [],
      inProgress: [],
      waiting: [],
      done: [],
      canceled: [],
    };

    for (const task of tasks) {
      if (!task._deleted) groups[normalizeTaskStatus(task.status)]?.push(task);
    }

    return Object.fromEntries(
      Object.entries(groups).map(([status, records]) => [status, sortPipelineTasks(records)]),
    ) as Record<TaskStatus, TaskRecord[]>;
  }, [tasks]);

  const visibleStatuses =
    statusFilter === "all"
      ? STATUSES
      : STATUSES.filter((status) => status === normalizeTaskStatus(statusFilter));

  return (
    <div className="h-full overflow-auto px-4 py-4">
      <div className="min-w-[920px] space-y-6">
        {visibleStatuses.map((status) => {
          const statusTasks = groupedTasks[status];
          return (
            <section key={status} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[status])} />
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white",
                    status === "done" && "bg-emerald-600",
                    status === "inProgress" && "bg-blue-600",
                    status === "waiting" && "bg-violet-600",
                    status === "todo" && "bg-zinc-600",
                    status === "canceled" && "bg-zinc-600",
                  )}
                >
                  {TASK_STATUS_LABEL[status]}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">{statusTasks.length}</span>
              </div>

              <div className="overflow-hidden border-y border-border/70">
                <div className="grid h-8 grid-cols-[minmax(260px,1.5fr)_140px_140px_120px_minmax(180px,1fr)] items-center border-b border-border/70 text-[10px] font-semibold text-muted-foreground">
                  <div className="px-3">Name</div>
                  <div className="px-3">Assignee</div>
                  <div className="px-3">Due date</div>
                  <div className="px-3">Priority</div>
                  <div className="px-3">Action items</div>
                </div>

                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid min-h-9 grid-cols-[minmax(260px,1.5fr)_140px_140px_120px_minmax(180px,1fr)] items-center border-b border-border/50 text-xs last:border-b-0 hover:bg-muted/25"
                  >
                    <div className="flex min-w-0 items-center gap-2 px-3 py-2">
                      {task.status === "done" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate font-semibold text-foreground">{task.title}</span>
                    </div>

                    <div className="px-3 text-muted-foreground">
                      {task.assigneeUserId ? (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" />
                          <span className="truncate">{task.assigneeUserId}</span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </div>

                    <div className={cn("px-3 font-medium", getDueDateColor(task.dueDate))}>
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </div>

                    <div className={cn("px-3 font-semibold", PRIORITY_COLOR[task.priority])}>
                      <span className="inline-flex items-center gap-1.5">
                        <Flag className="h-3.5 w-3.5" />
                        {task.priority}
                      </span>
                    </div>

                    <div className="px-3 text-muted-foreground">-</div>
                  </div>
                ))}

                {statusTasks.length === 0 && (
                  <div className="flex h-9 items-center px-10 text-xs font-medium text-muted-foreground">
                    + Add Task
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
