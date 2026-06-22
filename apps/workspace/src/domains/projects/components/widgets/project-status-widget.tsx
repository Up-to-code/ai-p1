"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useProjectsIndexQuery } from "../../api/projects";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  planned: "#94a3b8",
  active: "#22c55e",
  paused: "#f59e0b",
  completed: "#3b82f6",
  archived: "#d1d5db",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

export function ProjectStatusWidget() {
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const query = useProjectsIndexQuery(orgId);
  const projects = query.results ?? [];

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        fill: STATUS_COLORS[status] || "#94a3b8",
      }));
  }, [projects]);

  const total = projects.length;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground/60">
        No projects yet
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
                    <p className="text-xs text-muted-foreground">{data.value} projects</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-2">
        <p className="text-2xl font-black text-foreground">{total}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Projects</p>
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
