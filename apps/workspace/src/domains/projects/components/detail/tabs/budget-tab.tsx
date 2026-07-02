"use client";

import React, { useMemo } from "react";
import { ProgressBar } from "@qentrah/our-platform-components";
import { type Project } from "../../../store/projects.types";
import { type ProjectFormValues } from "../../../validation/project.schema";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
} from "lucide-react";

interface BudgetTabProps {
  project: Project;
  onUpdate: (values: Partial<ProjectFormValues>) => void;
}

export function BudgetTab({ project, onUpdate }: BudgetTabProps) {
  const account = useAccountContext();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId ?? "" : "";
  const tasksResult = useTasksQuery(organizationId, { projectId: project.id });
  const tasks = tasksResult.data ?? [];

  const budget = project.budget ?? 0;

  // Simulated budget breakdown based on task completion
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t: any) => t.status === "done").length;
    const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    const daysElapsed = project.startDate
      ? Math.max(0, Math.floor((Date.now() - new Date(project.startDate).getTime()) / 86400000))
      : 0;
    const totalDuration = project.startDate && project.endDate
      ? Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 86400000)
      : 30;
    const timeProgress = totalDuration > 0 ? (daysElapsed / totalDuration) * 100 : 0;

    const spent = budget > 0 ? Math.round(budget * (progress / 100)) : 0;
    const remaining = budget - spent;
    const burnRate = daysElapsed > 0 ? Math.round(spent / daysElapsed) : 0;

    return { progress, timeProgress, spent, remaining, burnRate, daysElapsed };
  }, [tasks, project, budget]);

  const metrics = [
    { label: "Total Budget", value: budget ? `$${budget.toLocaleString()}` : "—", icon: DollarSign, color: "text-primary" },
    { label: "Spent", value: budget ? `$${stats.spent.toLocaleString()}` : "—", icon: Receipt, color: "text-amber-500" },
    { label: "Remaining", value: budget ? `$${stats.remaining.toLocaleString()}` : "—", icon: Wallet, color: "text-emerald-500" },
    { label: "Burn Rate", value: stats.burnRate > 0 ? `$${stats.burnRate}/day` : "—", icon: TrendingDown, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/20 transition-colors">
            <div className={cn("p-2 bg-primary/10 rounded-lg", m.color)}>
              <m.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="text-xl font-black text-foreground">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Budget vs Progress */}
      {budget > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Budget Utilization</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Time Progress</span>
                <span className="font-bold text-foreground">{Math.round(stats.timeProgress)}%</span>
              </div>
              <ProgressBar
                value={stats.timeProgress}
                size="lg"
                fillClassName="bg-muted-foreground/40"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Budget Spent</span>
                <span className="font-bold text-foreground">{Math.round(stats.progress)}%</span>
              </div>
              <ProgressBar value={stats.progress} size="lg" />
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-4 pt-4 border-t border-border">
            {stats.progress > stats.timeProgress + 10 ? (
              <p className="text-xs text-red-500 font-semibold">Over budget — spending faster than planned</p>
            ) : stats.progress < stats.timeProgress - 10 ? (
              <p className="text-xs text-emerald-500 font-semibold">Under budget — spending slower than planned</p>
            ) : (
              <p className="text-xs text-muted-foreground font-semibold">On track — spending aligned with timeline</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {budget === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <DollarSign className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">No budget set</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Edit the project to set a budget and track finances
          </p>
        </div>
      )}
    </div>
  );
}
