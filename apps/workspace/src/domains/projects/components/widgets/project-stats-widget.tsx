"use client";

import { useMemo } from "react";
import { useProjectsIndexQuery, useProjectTaskCounts } from "../../api/projects";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { DollarSign, CheckCircle2, Clock, TrendingUp, AlertTriangle } from "lucide-react";

export function ProjectStatsWidget() {
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const query = useProjectsIndexQuery(orgId);
  const projects = query.results ?? [];
  const taskCounts = useProjectTaskCounts(orgId);
  const counts: Record<string, number> = taskCounts ?? {};

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const atRisk = projects.filter((p) => p.health === "atRisk" || p.health === "blocked").length;

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget ?? 0), 0);
    const totalTasks = Object.values(counts).reduce((sum, c) => sum + c, 0);

    const avgProgress = total > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / total)
      : 0;

    return { total, active, completed, atRisk, totalBudget, totalTasks, avgProgress };
  }, [projects, counts]);

  const formatCurrency = (val: number) => {
    if (val === 0) return "—";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const metrics = [
    { label: "Total", value: String(stats.total), icon: TrendingUp, color: "text-primary" },
    { label: "Active", value: String(stats.active), icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Completed", value: String(stats.completed), icon: CheckCircle2, color: "text-sky-500" },
    { label: "At Risk", value: String(stats.atRisk), icon: AlertTriangle, color: "text-amber-500" },
    { label: "Budget", value: formatCurrency(stats.totalBudget), icon: DollarSign, color: "text-primary" },
    { label: "Avg Progress", value: `${stats.avgProgress}%`, icon: TrendingUp, color: "text-indigo-500" },
  ];

  return (
    <div className="h-full flex flex-col p-4">
      <div className="grid grid-cols-2 gap-3 flex-1">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col justify-center rounded-xl bg-muted/30 p-3">
            <div className={cn("p-1.5 rounded-md inline-flex w-fit mb-2", m.color, "bg-current/10")}>
              <m.icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
            <p className="text-lg font-black text-foreground mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
