"use client";

import { cn } from "@/lib/utils";
import {
  Calendar,
  AlertTriangle,
  Bell,
  Flag,
  Focus,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react";
import type { CalendarEvent } from "@/domains/calendar/store/calendar.types";

const typeConfig: Record<
  CalendarEvent["type"],
  { icon: typeof Calendar; color: string; label: string }
> = {
  meeting: {
    icon: Calendar,
    color: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300",
    label: "Meeting",
  },
  deadline: {
    icon: AlertTriangle,
    color: "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300",
    label: "Deadline",
  },
  reminder: {
    icon: Bell,
    color: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300",
    label: "Reminder",
  },
  milestone: {
    icon: Flag,
    color: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300",
    label: "Milestone",
  },
  focusBlock: {
    icon: Focus,
    color: "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300",
    label: "Focus",
  },
};

const statusConfig: Record<
  CalendarEvent["status"],
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  confirmed: {
    icon: CheckCircle2,
    color: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300",
    label: "Confirmed",
  },
  pending: {
    icon: Clock,
    color: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300",
    label: "Pending",
  },
  draft: {
    icon: Circle,
    color: "bg-muted border-border text-muted-foreground",
    label: "Draft",
  },
};

export function EventTypeBadge({
  type,
  className,
}: {
  type: CalendarEvent["type"];
  className?: string;
}) {
  const config = typeConfig[type] || typeConfig.meeting;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
        config.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function EventStatusBadge({
  status,
  className,
}: {
  status: CalendarEvent["status"];
  className?: string;
}) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
        config.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function EventTypeDot({ type }: { type: CalendarEvent["type"] }) {
  const config = typeConfig[type] || typeConfig.meeting;
  const dotColor = type === "meeting" ? "bg-amber-500" : type === "deadline" ? "bg-red-500" : type === "reminder" ? "bg-sky-500" : type === "milestone" ? "bg-emerald-500" : "bg-violet-500";
  return <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />;
}
