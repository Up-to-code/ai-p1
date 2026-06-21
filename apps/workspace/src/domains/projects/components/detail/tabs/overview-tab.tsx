"use client";

import React, { useState, useMemo } from "react";
import { type Project } from "../../../store/projects.types";
import { type ProjectFormValues } from "../../../validation/project.schema";
import { EditableText } from "@/components/ui/editable-text";
import { EditableSelect } from "@/components/ui/editable-select";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useCalendarIndexRangeQueryResult } from "@/domains/calendar/api/calendar";
import { useAccountContext } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  FolderKanban,
  Plus,
  Settings,
  Activity,
  Users,
} from "lucide-react";
import { CustomFieldsSection } from "@/components/shared/custom-fields";
import { Link } from "@/i18n/routing";

interface OverviewTabProps {
  project: Project;
  onUpdate: (values: Partial<ProjectFormValues>) => void;
}

export function OverviewTab({ project, onUpdate }: OverviewTabProps) {
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready" ? account.workspace.organizationId ?? "" : "";

  // Real Queries
  const tasksResult = useTasksQuery(organizationId, { projectId: project.id });
  const tasks = tasksResult.data ?? [];
  const now = Date.now();
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).getTime();
  const calendarResult = useCalendarIndexRangeQueryResult(organizationId, startOfMonth, endOfMonth, project.id);
  const calendarEvents = calendarResult.data?.events ?? [];

  // Derived Metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: any) => t.status === "done").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : (project.progress ?? 0);

  const daysLeft = useMemo(() => {
    if (!project.endDate) return null;
    const end = new Date(project.endDate).getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [project.endDate]);

  const daysElapsed = useMemo(() => {
    if (!project.startDate) return null;
    const start = new Date(project.startDate).getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [project.startDate]);

  const totalDuration = useMemo(() => {
    if (!project.startDate || !project.endDate) return null;
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }, [project.startDate, project.endDate]);

  const upcomingEvents = calendarEvents
    .filter((e: any) => e.startAt && e.startAt > now)
    .sort((a: any, b: any) => (a.startAt ?? 0) - (b.startAt ?? 0))
    .slice(0, 5);

  const recentTasks = tasks
    .filter((t: any) => t.status !== "done")
    .sort((a: any, b: any) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const metrics = [
    { label: "Budget", value: project.budget ? `$${Number(project.budget).toLocaleString()}` : "—", icon: DollarSign, color: "text-primary" },
    { label: "Tasks Done", value: `${doneTasks}/${totalTasks}`, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Days Left", value: daysLeft !== null ? String(daysLeft) : "—", icon: Clock, color: "text-amber-500" },
    { label: "Progress", value: `${progress}%`, icon: TrendingUp, color: "text-sky-500" },
  ];

  const properties = [
    { label: "Client", value: project.clientId ? "Linked" : "—", editable: false },
    { label: "Status", value: project.status, editable: true, field: "status", type: "select",
      options: [
        { label: "Planned", value: "planned" },
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Completed", value: "completed" },
        { label: "Archived", value: "archived" },
      ],
      colors: { planned: "gray", active: "green", paused: "yellow", completed: "blue", archived: "gray" },
    },
    { label: "Health", value: project.health, editable: true, field: "health", type: "select",
      options: [
        { label: "On Track", value: "onTrack" },
        { label: "At Risk", value: "atRisk" },
        { label: "Blocked", value: "blocked" },
      ],
      colors: { onTrack: "green", atRisk: "yellow", blocked: "red" },
    },
    { label: "Start Date", value: project.startDate || "—", editable: false },
    { label: "End Date", value: project.endDate || "—", editable: false },
    { label: "Budget", value: project.budget ? `$${Number(project.budget).toLocaleString()}` : "—", editable: false },
    { label: "Visibility", value: project.visibility || "team", editable: true, field: "visibility", type: "select",
      options: [
        { label: "Private", value: "private" },
        { label: "Team", value: "team" },
        { label: "Workspace", value: "workspace" },
      ],
      colors: { private: "gray", team: "blue", workspace: "green" },
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="xl:col-span-2 space-y-10">
        {/* Project Info — Notion property grid */}
        <section>
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Project Details
            </h2>
          </div>
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="p-4 space-y-0 divide-y divide-border/50">
              {properties.map((prop) => (
                <div
                  key={prop.label}
                  className="group grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4 px-2 py-3 text-sm transition-colors hover:bg-muted/35 rounded-lg"
                >
                  <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                    <span className="truncate text-xs font-bold uppercase tracking-wider">{prop.label}</span>
                  </div>
                  <div className="min-w-0 text-sm font-medium text-foreground">
                    {prop.editable && prop.type === "select" && prop.options ? (
                      <EditableSelect
                        value={String(prop.value)}
                        options={prop.options}
                        onChange={(val) => onUpdate({ [prop.field!]: val })}
                        colorMapType={`project-${prop.field}`}
                        defaultColors={prop.colors as any}
                      />
                    ) : (
                      <span className={prop.value === "—" ? "text-muted-foreground/40" : ""}>
                        {prop.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Description */}
        <section>
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Description
            </h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description || "No description yet. Click to add one."}
            </p>
          </div>
        </section>

        {/* Upcoming Tasks */}
        <section>
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Upcoming Tasks
            </h2>
            <Link
              href={`/projects/${project.id}?tab=tasks`}
              className="text-[10px] text-primary/70 hover:text-primary font-semibold transition-colors"
            >
              View all →
            </Link>
          </div>
          {recentTasks.length > 0 ? (
            <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border">
              {recentTasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors group">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                    task.priority === "urgent"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      : task.priority === "high"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-muted text-muted-foreground border-border",
                  )}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No upcoming tasks.</p>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-10">
        {/* Quick Stats */}
        <section>
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Quick Stats
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors">
                <div className={cn("p-2 bg-primary/10 rounded-lg inline-flex mb-2", m.color)}>
                  <m.icon className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <p className="text-lg font-black text-foreground mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Bar */}
        {project.startDate && project.endDate && (
          <section>
            <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Timeline
              </h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                <span>{project.startDate}</span>
                <span>{project.endDate}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {daysElapsed ?? 0} of {totalDuration ?? 0} days
                </span>
                <span className="text-[10px] font-bold text-primary">{progress}%</span>
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Upcoming Events
            </h2>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map((event: any) => (
                <div key={event.id} className="rounded-xl border border-border bg-card p-3 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary capitalize">
                      {event.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  {event.startAt && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(event.startAt).toLocaleDateString()} at{" "}
                      {new Date(event.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">No upcoming events.</p>
            </div>
          )}
        </section>

        {/* Custom Fields */}
        <section>
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5" />
              Custom Fields
            </h2>
            <Link
              href="/settings/organization/custom-fields"
              className="text-[10px] text-primary/70 hover:text-primary font-semibold transition-colors"
            >
              Manage →
            </Link>
          </div>
          <CustomFieldsSection recordType="project" recordId={project.id} />
        </section>
      </div>
    </div>
  );
}
