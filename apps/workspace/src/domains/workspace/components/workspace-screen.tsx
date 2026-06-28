"use client";

import { useState } from "react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Folder,
  Lock,
  FileText,
  ChevronRight,
  Star,
  Link2,
  Settings,
  Brain,
  Share2,
  ChevronDown,
} from "lucide-react";
import { WorkspaceTabSwitcher } from "./workspace-tab-switcher";
import { SpaceSwitcher } from "@/components/layout/space-switcher";
import { WorkspaceWidgetGrid } from "./workspace-widget-grid";
import { useAccountContext } from "@/domains/auth";
import { useTasksQuery, useTaskStatsQuery } from "@/domains/tasks/api/tasks";
import { useUpcomingCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import { useDocsQuery, useDocFoldersQuery } from "@/domains/docs/api/docs";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useAgentThreadsQuery } from "@/domains/agents";

// ── Helpers ──

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </span>
  );
}

function WidgetHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      {children}
    </div>
  );
}

// ── Metric Summary Cards ──

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 bg-card rounded-lg p-3">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="text-[24px] font-[500] text-foreground mt-1">{value}</p>
    </div>
  );
}

function MetricCards({ organizationId }: { organizationId?: string }) {
  const taskStats = useTaskStatsQuery(organizationId);
  const threads = useAgentThreadsQuery(organizationId, { enabled: Boolean(organizationId), limit: 50 });
  const upcomingEvents = useUpcomingCalendarEventsQuery(organizationId, { limit: 10 });

  const openTasks = taskStats?.open ?? 0;
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

function AiBrainWidget() {
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

function FoldersWidget({ organizationId }: { organizationId?: string }) {
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

function PortfolioWidget({ organizationId }: { organizationId?: string }) {
  const projectsResult = useProjectsIndexQuery(organizationId);
  const projects = projectsResult?.results ?? [];

  return (
    <div className="bg-card rounded-xl p-3 flex flex-col">
      <WidgetHeader>
        <span className="text-sm font-medium">Portfolio</span>
        <WorkspaceLink
          href="/projects"
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          See all
        </WorkspaceLink>
      </WidgetHeader>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-muted-foreground border-b border-border/30">
            <th className="font-medium pb-2 pr-3">Name</th>
            <th className="font-medium pb-2 pr-3 w-16">Color</th>
            <th className="font-medium pb-2 pr-3">Progress</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.slice(0, 4).map((project: any) => {
              const progress = project.taskCount?.completed ?? 0;
              const total = project.taskCount?.total ?? 0;
              const color = project.color ?? "#4F80FF";

              return (
                <tr
                  key={project.id}
                  className="border-b border-border/10 last:border-0"
                >
                  <td className="py-2.5 pr-3 text-foreground font-medium">
                    {project.name}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div
                      className="size-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width:
                              total > 0
                                ? `${(progress / total) * 100}%`
                                : "0%",
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {progress}/{total}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="py-4 text-center text-xs text-muted-foreground">
                No projects yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Calendar Today Widget ──

function CalendarTodayWidget({ organizationId }: { organizationId?: string }) {
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

function RecentConversationsWidget({ organizationId }: { organizationId?: string }) {
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

function DocsWidget({ organizationId }: { organizationId?: string }) {
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

// ── Main Export ──

function WorkspaceHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border/50 px-6 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">All Tasks</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <button
          type="button"
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Star className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Link2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Settings className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Brain className="h-3.5 w-3.5" />
        </Button>
        <Button className="h-7 rounded-lg px-3 text-[12px] font-semibold">
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Share
        </Button>
      </div>
    </div>
  );
}

export function WorkspaceScreen() {
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <WorkspaceHeader />
        <WorkspaceTabSwitcher />
        <div className="flex-1 overflow-hidden p-6">
          <WorkspaceWidgetGrid
            isWidgetModalOpen={isWidgetModalOpen}
            onWidgetModalClose={() => setIsWidgetModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

export { MetricCards, FoldersWidget, PortfolioWidget, CalendarTodayWidget, RecentConversationsWidget, DocsWidget, AiBrainWidget };
