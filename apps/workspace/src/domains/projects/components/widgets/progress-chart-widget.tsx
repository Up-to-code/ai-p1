"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDashboardContext } from "../dashboard-context";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  todo: "var(--q-text-muted)",
  inProgress: "var(--q-info)",
  waiting: "var(--q-warning)",
  done: "var(--q-success)",
  canceled: "var(--q-border-strong)",
};

export function ProgressChartWidget() {
  const t = useTranslations("Widgets.progressChart");
  const { projectId, organizationId } = useDashboardContext();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const project = useProjectQuery(organizationId, projectId);

  const progress = useMemo(() => {
    if (tasks.length === 0) return project?.progress ?? 0;
    const done = tasks.filter((t) => t.status === "done").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks, project]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of tasks) {
      counts[task.status] = (counts[task.status] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        status,
        count,
        color: STATUS_COLORS[status] || "#94a3b8",
      }));
  }, [tasks]);

  const daysLeft = useMemo(() => {
    if (!project?.endDate) return null;
    const end = new Date(project.endDate).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }, [project?.endDate]);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Progress Ring */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/50" />
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress} ${100 - progress}`}
              className="text-primary"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-foreground">{progress}%</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-foreground">{t("tasks", { count: tasks.length })}</p>
          <p className="text-xs text-muted-foreground">{t("completed", { count: tasks.filter((t) => t.status === "done").length })}</p>
          {daysLeft !== null && (
            <p className="text-xs text-muted-foreground">{t("daysLeft", { days: daysLeft })}</p>
          )}
        </div>
      </div>

      {/* Status Bar Chart */}
      {statusBreakdown.length > 0 && (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusBreakdown} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="status"
                width={80}
                tick={({ x, y, payload }) => {
                  const label = payload.value === "inProgress" ? "In Progress" : payload.value.charAt(0).toUpperCase() + payload.value.slice(1);
                  return (
                    <text x={x} y={y} dy={4} textAnchor="end" className="fill-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                      {label}
                    </text>
                  );
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                      <p className="text-xs font-bold text-foreground">{data.count} tasks</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {statusBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
