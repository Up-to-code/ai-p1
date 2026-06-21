"use client";

import React, { useState, useMemo } from "react";
import { type Project } from "../../../store/projects.types";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useCalendarIndexRangeQueryResult } from "@/domains/calendar/api/calendar";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Edit3,
  Filter,
} from "lucide-react";

interface ActivityTabProps {
  project: Project;
  organizationId: string;
}

type ActivityFilter = "all" | "tasks" | "calendar" | "changes";

export function ActivityTab({ project, organizationId }: ActivityTabProps) {
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const tasksResult = useTasksQuery(organizationId, { projectId: project.id });
  const tasks = tasksResult.data ?? [];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).getTime();
  const calendarResult = useCalendarIndexRangeQueryResult(organizationId, startOfMonth, endOfMonth, project.id);
  const calendarEvents = calendarResult.data?.events ?? [];

  // Build activity feed from tasks + calendar events
  const activities = useMemo(() => {
    const items: Array<{
      id: string;
      type: "task" | "calendar" | "change";
      title: string;
      description?: string;
      timestamp: number;
      status?: string;
    }> = [];

    // Tasks as activity items
    for (const task of tasks) {
      items.push({
        id: `task-${task.id}`,
        type: "task",
        title: task.title,
        description: task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : undefined,
        timestamp: task.updatedAt ?? task.createdAt,
        status: task.status,
      });
    }

    // Calendar events as activity items
    for (const event of calendarEvents) {
      items.push({
        id: `event-${event.id}`,
        type: "calendar",
        title: event.title,
        description: event.location || undefined,
        timestamp: event.startAt ?? Date.now(),
        status: event.status,
      });
    }

    // Project creation as activity
    items.push({
      id: "project-created",
      type: "change",
      title: "Project created",
      description: `Project "${project.name}" was created`,
      timestamp: project._creationTime,
    });

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [tasks, calendarEvents, project]);

  const filteredActivities = filter === "all"
    ? activities
    : activities.filter((a) => a.type === filter);

  const filterOptions: { value: ActivityFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "tasks", label: "Tasks" },
    { value: "calendar", label: "Calendar" },
    { value: "changes", label: "Changes" },
  ];

  function getActivityIcon(type: string, status?: string) {
    if (type === "task") {
      return status === "done"
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        : <Circle className="h-4 w-4 text-muted-foreground/40" />;
    }
    if (type === "calendar") {
      return <Calendar className="h-4 w-4 text-blue-500" />;
    }
    return <Edit3 className="h-4 w-4 text-amber-500" />;
  }

  function formatTimestamp(ts: number) {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "h-7 rounded-lg px-3 text-[11px] font-semibold transition-all capitalize",
              filter === opt.value
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      {filteredActivities.length > 0 ? (
        <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 hover:bg-muted/10 transition-colors group"
            >
              <div className="mt-0.5 shrink-0">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  activity.status === "done" ? "line-through text-muted-foreground" : "text-foreground",
                )}>
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                )}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                {formatTimestamp(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <ActivityIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">No activity found.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Activity will appear here as tasks and events are updated.
          </p>
        </div>
      )}
    </div>
  );
}
