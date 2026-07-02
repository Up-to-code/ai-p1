"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useProjectsIndexQuery } from "../../api/projects";
import { useAuthSession } from "@/domains/auth";
import { DollarSign } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  planned: "#94a3b8",
  active: "#22c55e",
  paused: "#f59e0b",
  completed: "#5F7768",
  archived: "#d1d5db",
};

export function BudgetOverviewWidget() {
  const session = useAuthSession();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const query = useProjectsIndexQuery(orgId);
  const projects = query.results ?? [];

  const { chartData, totalBudget } = useMemo(() => {
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const p of projects) {
      const budget = p.budget ?? 0;
      byStatus[p.status] = (byStatus[p.status] || 0) + budget;
      total += budget;
    }
    const data = Object.entries(byStatus)
      .filter(([, val]) => val > 0)
      .map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value,
        fill: STATUS_COLORS[status] || "#94a3b8",
      }));
    return { chartData: data, totalBudget: total };
  }, [projects]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  if (totalBudget === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <DollarSign className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground/60">No budget data</p>
        <p className="text-xs text-muted-foreground/40 mt-1">Add budgets to your projects</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="text-center mb-3">
        <p className="text-2xl font-black text-foreground">{formatCurrency(totalBudget)}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Budget</p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
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
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
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
