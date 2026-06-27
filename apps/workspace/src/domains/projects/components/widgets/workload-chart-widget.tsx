"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardContext } from "../dashboard-context";
import { useTasksQuery } from "@/domains/tasks/api/tasks";

const STATUS_COLORS: Record<string, string> = {
  todo: "#94a3b8",
  inProgress: "#4F80FF",
  waiting: "#f59e0b",
  done: "#22c55e",
  canceled: "#d1d5db",
};

export function WorkloadChartWidget() {
  const t = useTranslations("Widgets.workloadChart");
  const { projectId, organizationId } = useDashboardContext();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of tasks) {
      counts[task.status] = (counts[task.status] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: t(`statusLabels.${status}`),
        value: count,
        fill: STATUS_COLORS[status] || "#94a3b8",
      }));
  }, [tasks, t]);

  const total = tasks.length;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground/60">
        {t("noTasksToDisplay")}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                    <p className="text-xs font-bold text-foreground">{data.name}</p>
                    <p className="text-xs text-muted-foreground">{t("tasks", { count: data.value })}</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-2">
        <p className="text-2xl font-black text-foreground">{total}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("totalTasks")}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-3 pt-3 border-t border-border/40">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="text-[10px] font-semibold text-muted-foreground">{item.name}</span>
            <span className="text-[10px] font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
