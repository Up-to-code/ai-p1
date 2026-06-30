"use client";

import { useState, useMemo } from "react";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import { ChevronDown, Check, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PRIORITY_COLORS, priorityStyleFor } from "./shared";
import { TaskListSkeleton } from "@/domains/tasks/components/task-list-skeleton";

export function TaskListView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  if (tasksResult.data === undefined) return <TaskListSkeleton />;
  const tasks = tasksResult.data;
  const { updateTask } = useTaskMutations(organizationId);

  const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({
    todo: true,
    inProgress: true,
    waiting: true,
    done: true,
  });

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === "todo"),
      inProgress: tasks.filter(t => t.status === "inProgress"),
      waiting: tasks.filter(t => t.status === "waiting"),
      done: tasks.filter(t => t.status === "done" || t.status === "canceled"),
    };
  }, [tasks]);

  const toggleExpand = (status: string) => {
    setExpandedStatus(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleUpdate = async (task: any, updates: any) => {
    try {
      await updateTask(task.id, updates);
    } catch {
      /* error already handled by useTaskMutations */
    }
  };

  const renderGroup = (statusKey: string, title: string, list: any[], colorStyle: any) => {
    const isExpanded = expandedStatus[statusKey];
    return (
      <div key={statusKey} className="space-y-1 bg-card rounded-2xl border border-border/80 p-3 shadow-sm">
        <button
          onClick={() => toggleExpand(statusKey)}
          className="flex items-center gap-2 w-full text-left font-black uppercase text-xs tracking-wider pb-2 border-b border-border/40"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span style={{ color: colorStyle.text }}>{title}</span>
          <span className="bg-muted text-muted-foreground font-black px-1.5 py-0.5 rounded-full text-[9px] ml-2">
            {list.length}
          </span>
        </button>

        {isExpanded && (
          <div className="pt-2 divide-y divide-border/30">
            {list.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60 py-3 text-center">No tasks in this status</p>
            ) : (
              list.map((task) => {
                const ps = priorityStyleFor(task.priority);
                return (
                  <div key={task.id} className="flex items-center justify-between py-2.5 group">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdate(task, { status: task.status === "done" ? "todo" : "done" })}
                        className="h-4 w-4 rounded border transition-colors flex items-center justify-center"
                        style={
                          task.status === "done"
                            ? { background: "var(--q-success)", borderColor: "var(--q-success)", color: "var(--q-surface)" }
                            : { borderColor: "var(--q-border-strong)" }
                        }
                      >
                        {task.status === "done" && <Check className="h-3 w-3" />}
                      </button>
                      <span className={cn("text-xs font-bold text-foreground", task.status === "done" && "line-through text-muted-foreground/50")}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <Calendar className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span
                        className="text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-0.5"
                        style={{ background: ps.bg, color: ps.text, borderColor: ps.border }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
      {renderGroup("todo", "To Do", tasksByStatus.todo, STATUS_COLORS.todo)}
      {renderGroup("inProgress", "In Progress", tasksByStatus.inProgress, STATUS_COLORS.inProgress)}
      {renderGroup("waiting", "Waiting", tasksByStatus.waiting, STATUS_COLORS.waiting)}
      {renderGroup("done", "Complete / Done", tasksByStatus.done, STATUS_COLORS.done)}
    </div>
  );
}
