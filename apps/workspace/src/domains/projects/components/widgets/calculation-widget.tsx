"use client";

import { ProgressBar } from "@qentrah/our-platform-components";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDashboardContext } from "../dashboard-context";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { Calculator, CheckCircle2, ListTodo, AlertTriangle, PlayCircle } from "lucide-react";

export function CalculationWidget() {
  const t = useTranslations("Widgets.taskTable");
  const { projectId, organizationId } = useDashboardContext();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const inProgress = tasks.filter((t) => t.status === "inProgress").length;
    const urgent = tasks.filter((t) => t.priority === "urgent" || t.priority === "high").length;

    return { total, done, progress, inProgress, urgent };
  }, [tasks]);

  return (
    <div className="h-full flex flex-col p-4 justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Project Calculations
        </span>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="bg-muted/30 border border-border/40 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ListTodo className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Tasks</span>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{stats.total}</p>
        </div>

        <div className="bg-muted/30 border border-border/40 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{stats.done}</p>
        </div>

        <div className="bg-muted/30 border border-border/40 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <PlayCircle className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{stats.inProgress}</p>
        </div>

        <div className="bg-muted/30 border border-border/40 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Urgent/High</span>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{stats.urgent}</p>
        </div>
      </div>

      {/* Footer Completion Rate */}
      <div className="mt-4 pt-3 border-t border-border/40">
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1.5">
          <span>COMPLETION RATE</span>
          <span className="text-foreground">{stats.progress}%</span>
        </div>
        <ProgressBar value={stats.progress} size="lg" />
      </div>
    </div>
  );
}
