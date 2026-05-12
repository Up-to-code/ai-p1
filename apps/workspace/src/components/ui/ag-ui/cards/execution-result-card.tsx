"use client";

import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgCardShell } from "../ag-card-shell";
import type { AgUiCardComponentProps } from "../types";

type ExecutionResultCardProps = {
  title?: string;
  summary?: string;
  status?: "completed" | "executing" | "failed" | "blocked";
  details?: Array<{ label: string; value: string }>;
};

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    className: "border-success/20 bg-success/10 text-success",
  },
  executing: {
    icon: Clock3,
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  failed: {
    icon: AlertCircle,
    className: "border-danger/20 bg-danger/10 text-danger",
  },
  blocked: {
    icon: AlertCircle,
    className: "border-warning/20 bg-warning/10 text-warning",
  },
};

export function AgExecutionResultCard({
  title = "Execution result",
  summary,
  status = "completed",
  details = [],
}: AgUiCardComponentProps<ExecutionResultCardProps>) {
  const config = statusConfig[status] ?? statusConfig.completed;
  const Icon = config.icon;

  return (
    <AgCardShell className="rounded-[18px] p-4">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border", config.className)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-text-primary">{title}</h3>
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest", config.className)}>
              {status}
            </span>
          </div>
          {summary && (
            <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary">{summary}</p>
          )}
          {details.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={`${detail.label}:${detail.value}`} className="rounded-xl border border-border bg-background px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{detail.label}</p>
                  <p className="mt-1 truncate text-sm font-bold text-text-primary">{detail.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AgCardShell>
  );
}
