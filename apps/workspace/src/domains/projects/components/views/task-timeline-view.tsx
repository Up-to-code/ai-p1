"use client";

import { useMemo } from "react";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { Clock } from "lucide-react";
import { statusStyleFor } from "./shared";
import { TaskTimelineSkeleton } from "@/domains/tasks/components/task-timeline-skeleton";

export function TaskTimelineView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  if (tasksResult.data === undefined) return <TaskTimelineSkeleton />;
  const tasks = tasksResult.data;

  const timelineData = useMemo(() => {
    const withDue = tasks.filter(t => t.dueDate).map(t => ({
      ...t,
      dueTime: new Date(t.dueDate!).getTime(),
    })).sort((a, b) => a.dueTime - b.dueTime);

    if (withDue.length === 0) return [];

    const minTime = withDue[0].dueTime - 5 * 86400000; // start 5 days before first due date
    const maxTime = withDue[withDue.length - 1].dueTime + 5 * 86400000;
    const span = maxTime - minTime || 86400000;

    return withDue.map((t) => {
      // Simulate progress bar starting 3 days before due date
      const start = t.dueTime - 3 * 86400000;
      const left = Math.max(0, ((start - minTime) / span) * 100);
      const width = Math.min(100 - left, (3 * 86400000 / span) * 100);
      return {
        ...t,
        left,
        width: Math.max(width, 2),
      };
    });
  }, [tasks]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      <div className="pb-3 border-b border-border/40 mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Project Timeline & Duration Map</span>
        <span className="text-[10px] font-bold text-muted-foreground/60">{timelineData.length} tasks scheduled</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
        {timelineData.map((task) => {
          const statusStyle = statusStyleFor(task.status);
          return (
            <div key={task.id} className="flex items-center gap-3 p-2 bg-muted/10 border border-border/40 hover:border-primary/20 rounded-xl transition-colors">
              <div className="w-48 shrink-0 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{task.title}</p>
                <p className="text-[9px] text-muted-foreground/60 font-semibold mt-0.5">Due: {new Date(task.dueDate!).toLocaleDateString()}</p>
              </div>

              {/* Gantt Bar */}
              <div className="flex-1 relative h-6 bg-muted/30 border border-border/30 rounded-lg overflow-hidden">
                <div
                  className="absolute h-4 top-1 rounded-md transition-all border shadow-sm"
                  style={{
                    left: `${task.left}%`,
                    width: `${task.width}%`,
                    background: statusStyle.bg,
                    borderColor: statusStyle.border,
                  }}
                />
              </div>
            </div>
          );
        })}
        {timelineData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-bold text-muted-foreground/60">No tasks with due dates to map</p>
          </div>
        )}
      </div>
    </div>
  );
}
