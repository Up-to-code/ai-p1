"use client";

import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import { Calendar } from "lucide-react";
import { STATUS_COLORS, PRIORITY_COLORS, priorityStyleFor } from "./shared";
import { TaskBoardSkeleton } from "@/domains/tasks/components/task-board-skeleton";

export function TaskBoardView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const isLoading = tasksResult.data === undefined;
  const tasks = tasksResult.data ?? [];
  const { updateTask } = useTaskMutations(organizationId);

  const columns = [
    { key: "todo", label: "To Do", color: STATUS_COLORS.todo },
    { key: "inProgress", label: "In Progress", color: STATUS_COLORS.inProgress },
    { key: "waiting", label: "Waiting", color: STATUS_COLORS.waiting },
    { key: "done", label: "Done", color: STATUS_COLORS.done },
  ];

  const handleUpdate = async (task: any, updates: any) => {
    try {
      await updateTask(task, updates);
    } catch {
      /* error already handled by useTaskMutations */
    }
  };

  if (isLoading) return <TaskBoardSkeleton />;
  return (
    <div className="grid grid-cols-4 gap-4 h-[550px] overflow-hidden">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} className="flex flex-col bg-muted/20 border border-border/80 rounded-2xl p-3 h-full overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: col.color.text }}>{col.label}</span>
              <span className="bg-muted text-muted-foreground font-black px-1.5 py-0.5 rounded-full text-[9px]">
                {colTasks.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
              {colTasks.map((task) => {
                const priorityStyle = priorityStyleFor(task.priority);
                return (
                  <div key={task.id} className="bg-card border border-border/80 hover:border-primary/20 p-3 rounded-xl shadow-sm transition-colors group">
                    <h4 className="text-xs font-bold text-foreground leading-snug">{task.title}</h4>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/30">
                      {task.dueDate ? (
                        <span className="text-[9px] text-muted-foreground font-bold flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : <span />}

                      <span
                        className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        style={{ background: priorityStyle.bg, color: priorityStyle.text, borderColor: priorityStyle.border }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Cycle buttons */}
                    <div className="mt-2.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.filter(c => c.key !== task.status).slice(0, 2).map((c) => (
                        <button
                          key={c.key}
                          onClick={() => handleUpdate(task, { status: c.key })}
                          className="text-[9px] font-black text-muted-foreground hover:text-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                        >
                          → {c.label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && (
                <div className="text-center py-8 text-[11px] text-muted-foreground/40 font-bold">No Tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
