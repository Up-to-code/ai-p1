"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDashboardContext } from "../dashboard-context";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { DollarSign } from "lucide-react";

export function BudgetChartWidget() {
  const t = useTranslations("Widgets.budgetChart");
  const { projectId, organizationId } = useDashboardContext();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const project = useProjectQuery(organizationId, projectId);

  const budget = project?.budget ?? 0;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const estimatedSpent = useMemo(() => {
    if (budget === 0 || totalTasks === 0) return 0;
    return Math.round((doneTasks / totalTasks) * budget);
  }, [budget, totalTasks, doneTasks]);

  const remaining = budget - estimatedSpent;
  const utilizationPct = budget > 0 ? Math.round((estimatedSpent / budget) * 100) : 0;

  const chartData = [
    { name: "Spent", value: estimatedSpent, fill: "#4F80FF" },
    { name: "Remaining", value: Math.max(0, remaining), fill: "#e5e7eb" },
  ];

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  if (budget === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <DollarSign className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground/60">{t("noBudgetSet")}</p>
        <p className="text-xs text-muted-foreground/40 mt-1">{t("addBudgetHint")}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("budget")}</p>
          <p className="text-lg font-black text-foreground">{formatCurrency(budget)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("spent")}</p>
          <p className="text-lg font-black text-blue-500">{formatCurrency(estimatedSpent)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("remaining")}</p>
          <p className="text-lg font-black text-emerald-500">{formatCurrency(remaining)}</p>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("utilization")}</span>
          <span className="text-xs font-bold text-foreground">{utilizationPct}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, utilizationPct)}%` }}
          />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              tick={({ x, y, payload }) => (
                <text x={x} y={y} dy={4} textAnchor="end" className="fill-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  {payload.value}
                </text>
              )}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                    <p className="text-xs font-bold text-foreground">{formatCurrency(data.value)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
