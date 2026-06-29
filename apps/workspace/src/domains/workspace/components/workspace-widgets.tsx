"use client";

import { useMemo } from "react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Sparkles, Folder, FileText, ChevronRight, Star, Link2, 
  Settings, Brain, Share2, ChevronDown, Layers
} from "lucide-react";
import { useAccountContext } from "@/domains/auth";
import { useTasksQuery, useTaskStatsQuery } from "@/domains/tasks/api/tasks";
import { useUpcomingCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import { useDocsQuery, useDocFoldersQuery } from "@/domains/docs/api/docs";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useAgentThreadsQuery } from "@/domains/agents";
import { useNavigation } from "@/domains/navigation";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { cn } from "@/lib/utils";

// ── Helpers ──

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </span>
  );
}

export function WidgetHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      {children}
    </div>
  );
}

// ── Metric Summary Cards ──

export function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 bg-card rounded-lg p-3">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="text-[24px] font-[500] text-foreground mt-1">{value}</p>
    </div>
  );
}

export function MetricCards({ 
  organizationId, 
  spaceSlug, 
  projectId 
}: { 
  organizationId?: string; 
  spaceSlug?: string | null; 
  projectId?: string | null; 
}) {
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const spaces = useWorkspaceSpacesQuery(orgId);
  const activeSpace = spaces?.find((s) => s.slug === spaceSlug);

  const activeProjectId = projectId || activeSpace?.projectId || undefined;

  const tasksResult = useTasksQuery(organizationId, { projectId: activeProjectId });
  const tasks = tasksResult?.data ?? [];

  const threads = useAgentThreadsQuery(organizationId, { enabled: Boolean(organizationId), limit: 50 });
  const upcomingEvents = useUpcomingCalendarEventsQuery(organizationId, { limit: 10 });

  const openTasks = useMemo(() => {
    return tasks.filter(t => t.status !== "done" && t.status !== "canceled").length;
  }, [tasks]);

  const activeConversations = threads?.length ?? 0;
  const eventsToday = upcomingEvents?.length ?? 0;

  const metrics = [
    { label: "Open tasks", value: openTasks },
    { label: "Active conversations", value: activeConversations },
    { label: "Events today", value: eventsToday },
  ];

  return (
    <div className="flex gap-2.5 mb-2.5">
      {metrics.map((m) => (
        <MetricCard key={m.label} label={m.label} value={m.value} />
      ))}
    </div>
  );
}

// ── AI Brain Widget ──

export function AiBrainWidget() {
  return (
    <div className="bg-card rounded-xl p-3 flex flex-col h-full min-h-[320px]">
      <WidgetHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">AI Brain</span>
        </div>
      </WidgetHeader>
      <WorkspaceLink
        href="/ai"
        className="flex-1 flex flex-col items-center justify-center text-center rounded-lg hover:bg-muted/20 transition-colors"
      >
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-3">
          <Sparkles className="size-8 text-muted-foreground" />
        </div>
        <p className="text-[13px] text-muted-foreground">
          Ask Brain anything to get started.
        </p>
      </WorkspaceLink>
    </div>
  );
}

// ── Folders Widget ──

export function FoldersWidget({ organizationId }: { organizationId?: string }) {
  const folders = useDocFoldersQuery(organizationId);

  return (
    <div className="bg-card rounded-xl p-3 flex flex-col">
      <WidgetHeader>
        <span className="text-sm font-medium">Folders</span>
      </WidgetHeader>
      <div className="space-y-1">
        {folders?.data && folders.data.length > 0 ? (
          folders.data.slice(0, 5).map((folder: any) => (
            <WorkspaceLink
              key={folder.id}
              href="/docs"
              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Folder className="size-4 text-muted-foreground shrink-0" />
              <span className="text-[13px] flex-1 truncate">{folder.name}</span>
            </WorkspaceLink>
          ))
        ) : (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No folders yet
          </div>
        )}
      </div>
    </div>
  );
}

// ── Portfolio Widget ──

export function PortfolioWidget({ 
  organizationId, 
  spaceSlug, 
  projectId 
}: { 
  organizationId?: string; 
  spaceSlug?: string | null; 
  projectId?: string | null; 
}) {
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const spaces = useWorkspaceSpacesQuery(orgId);
  const activeSpace = spaces?.find((s) => s.slug === spaceSlug);

  const projectsResult = useProjectsIndexQuery(organizationId);
  const projects = projectsResult?.results ?? [];

  const filteredProjects = useMemo(() => {
    if (projectId) return projects.filter(p => p.id === projectId);
    if (activeSpace) return projects.filter(p => p.id === activeSpace.projectId);
    return projects;
  }, [projects, projectId, activeSpace]);

  return (
    <div className="bg-card rounded-xl p-4 flex flex-col h-full border border-border/60">
      <WidgetHeader>
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Project Portfolios & Budgets</span>
      </WidgetHeader>
      <div className="overflow-x-auto flex-1 mt-2 scrollbar-none">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-muted-foreground border-b border-border/40 pb-2">
              <th className="font-bold pb-2 pr-3">Name</th>
              <th className="font-bold pb-2 pr-3">Status</th>
              <th className="font-bold pb-2 pr-3">Progress</th>
              <th className="font-bold pb-2 pr-3">Budget</th>
              <th className="font-bold pb-2 pr-3">Spent</th>
              <th className="font-bold pb-2 pr-3">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.slice(0, 5).map((project: any) => {
                const progress = project.taskCount?.completed ?? 0;
                const total = project.taskCount?.total ?? 0;
                const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
                const budget = project.budget ?? 0;
                const spent = total > 0 ? Math.round((progress / total) * budget) : 0;
                const remaining = budget - spent;
                const color = project.color ?? "var(--q-info)";

                return (
                  <tr key={project.id} className="border-b border-border/10 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="py-3 pr-3 text-foreground font-bold">
                      {project.name}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border",
                        project.status === "completed"
                          ? "bg-[var(--q-success)]/10 text-[var(--q-success)] border-[var(--q-success)]/20"
                          : "bg-[var(--q-info)]/10 text-[var(--q-info)] border-[var(--q-info)]/20"
                      )}>
                        {project.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full animate-all"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-bold text-foreground">
                      {budget > 0 ? `$${budget.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 pr-3 text-[var(--q-info)] font-bold">
                      {budget > 0 ? `$${spent.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 pr-3 text-[var(--q-success)] font-bold">
                      {budget > 0 ? `$${remaining.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground font-bold">
                  No projects matching selection
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Calendar Today Widget ──

export function CalendarTodayWidget({ organizationId }: { organizationId?: string }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const upcomingEvents = useUpcomingCalendarEventsQuery(organizationId, {
    limit: 5,
    startAt: startOfDay.getTime(),
  });

  const eventsToday = upcomingEvents?.filter(
    (event: any) => event.startTime >= startOfDay.getTime() && event.startTime <= endOfDay.getTime()
  ) ?? [];

  return (
    <div className="bg-card rounded-xl p-3 flex flex-col">
      <WidgetHeader>
        <span className="text-sm font-medium">Today</span>
        <span className="text-[11px] text-muted-foreground">{today}</span>
      </WidgetHeader>
      <div className="space-y-2">
        {eventsToday.length > 0 ? (
          eventsToday.map((event: any) => {
            const time = new Date(event.startTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
            const color = event.color ?? "#4F80FF";

            return (
              <div key={event.id} className="flex items-center gap-2.5">
                <span className="text-[12px] text-muted-foreground w-14 shrink-0">
                  {time}
                </span>
                <div
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[13px] truncate">{event.title}</span>
              </div>
            );
          })
        ) : (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No events today
          </div>
        )}
        <WorkspaceLink
          href="/calendar"
          className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          View full schedule
          <ChevronRight className="size-3" />
        </WorkspaceLink>
      </div>
    </div>
  );
}

// ── Recent Conversations Widget ──

export function RecentConversationsWidget({ organizationId }: { organizationId?: string }) {
  const threads = useAgentThreadsQuery(organizationId, { enabled: Boolean(organizationId), limit: 5 });

  return (
    <div className="bg-card rounded-xl p-3 flex flex-col">
      <WidgetHeader>
        <span className="text-sm font-medium">Recent conversations</span>
        <WorkspaceLink
          href="/ai"
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          See all
        </WorkspaceLink>
      </WidgetHeader>
      <div className="space-y-1">
        {threads && threads.length > 0 ? (
          threads.map((thread: any) => {
            const initials = thread.title
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const timeAgo = thread.updatedAt
              ? new Date(thread.updatedAt).toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "";

            return (
              <WorkspaceLink
                key={thread.id}
                href={`/ai?threadId=${thread.id}`}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13px] flex-1 truncate">{thread.title}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {timeAgo}
                </span>
              </WorkspaceLink>
            );
          })
        ) : (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}

// ── Docs Widget ──

export function DocsWidget({ organizationId }: { organizationId?: string }) {
  const docs = useDocsQuery(organizationId);

  return (
    <div className="bg-card rounded-xl p-3 flex flex-col">
      <WidgetHeader>
        <span className="text-sm font-medium">Docs</span>
      </WidgetHeader>
      <div className="space-y-1">
        {docs?.data && docs.data.length > 0 ? (
          docs.data.slice(0, 3).map((doc: any) => (
            <WorkspaceLink
              key={doc.id}
              href={`/docs/${doc.id}`}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <FileText className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate">{doc.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {doc.folderId || "Root"}
                </p>
              </div>
            </WorkspaceLink>
          ))
        ) : (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No docs yet
          </div>
        )}
      </div>
      <WorkspaceLink
        href="/docs"
        className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors mt-2"
      >
        View all
        <ChevronRight className="size-3" />
      </WorkspaceLink>
    </div>
  );
}
