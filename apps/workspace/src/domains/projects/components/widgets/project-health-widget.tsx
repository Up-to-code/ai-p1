"use client";

import { useMemo } from "react";
import { LegendItem } from "@qentrah/ui";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useProjectsIndexQuery } from "../../api/projects";
import { useAuthSession } from "@/domains/auth";

const HEALTH_COLORS: Record<string, string> = {
  onTrack: "#22c55e",
  atRisk: "#f59e0b",
  blocked: "#ef4444",
};

const HEALTH_LABELS: Record<string, string> = {
  onTrack: "On Track",
  atRisk: "At Risk",
  blocked: "Blocked",
};

export function ProjectHealthWidget() {
  const session = useAuthSession();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const query = useProjectsIndexQuery(orgId);
  const projects = query.results ?? [];

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) {
      counts[p.health] = (counts[p.health] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([health, count]) => ({
        name: HEALTH_LABELS[health] || health,
        value: count,
        fill: HEALTH_COLORS[health] || "#94a3b8",
      }));
  }, [projects]);

  if (projects.length === 0) {
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
      <div className="flex flex-wrap justify-center gap-3 mt-3 pt-3 border-t border-border/40">
        {chartData.map((item) => (
          <LegendItem key={item.name} color={item.fill} label={item.name} value={item.value} />
        ))}
      </div>
    </div>
  );
}
