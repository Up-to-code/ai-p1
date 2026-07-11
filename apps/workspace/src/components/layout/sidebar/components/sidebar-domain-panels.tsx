"use client";

import {
  ListTodo,
  CalendarDays,
  UserRound,
  BadgeDollarSign,
  FileText,
  CheckCircle2,
  Clock,
  CalendarClock,
  CalendarCheck,
  UserX,
  Flag,
  Share2,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useAuthSession } from "@/domains/auth";
import { useDocsQuery } from "@/domains/docs/api/docs";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { SidebarPanelLink } from "./sidebar-panel-link";

export function SidebarTasksPanel() {
  return (
    <SidebarPanelLayout title="Tasks">
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/tasks" icon={ListTodo} label="All tasks" clearParams={["filter"]} />
        <SidebarPanelLink href="/tasks?filter=my" icon={UserRound} label="My tasks" paramKey="filter" paramValue="my" />
        <SidebarPanelLink href="/tasks?filter=assigned" icon={Share2} label="Assigned by me" paramKey="filter" paramValue="assigned" />
        <SidebarPanelLink href="/tasks?filter=unassigned" icon={UserX} label="Unassigned" paramKey="filter" paramValue="unassigned" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <SidebarPanelLink href="/tasks?filter=today" icon={CalendarCheck} label="Due today" paramKey="filter" paramValue="today" />
        <SidebarPanelLink href="/tasks?filter=upcoming" icon={CalendarClock} label="Upcoming" paramKey="filter" paramValue="upcoming" />
        <SidebarPanelLink href="/tasks?filter=completed" icon={CheckCircle2} label="Completed" paramKey="filter" paramValue="completed" />
        <SidebarPanelLink href="/tasks?filter=overdue" icon={Clock} label="Overdue" paramKey="filter" paramValue="overdue" />
        <SidebarPanelLink href="/tasks?filter=high-priority" icon={Flag} label="High priority" paramKey="filter" paramValue="high-priority" />
      </div>
    </SidebarPanelLayout>
  );
}

export function SidebarCalendarPanel() {
  return (
    <SidebarPanelLayout title="Calendar">
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/calendar" icon={CalendarDays} label="Calendar" clearParams={["view", "filter"]} />
      </div>
    </SidebarPanelLayout>
  );
}

export function SidebarClientsPanel() {
  return (
    <SidebarPanelLayout
      title="Clients"
      primaryAction={
        <WorkspaceLink
          href="/clients/create"
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          New client
        </WorkspaceLink>
      }
    >
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/clients" icon={UserRound} label="All clients" clearParams={["filter", "sort"]} />
        <SidebarPanelLink href="/clients?filter=active" icon={Users} label="Active clients" paramKey="filter" paramValue="active" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <SidebarPanelLink href="/clients?sort=recent" icon={Clock} label="Recent" paramKey="sort" paramValue="recent" />
      </div>
    </SidebarPanelLayout>
  );
}

export function SidebarDealsPanel() {
  return (
    <SidebarPanelLayout title="Deals">
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/deals" icon={BadgeDollarSign} label="All deals" clearParams={["filter", "sort"]} />
        <SidebarPanelLink href="/deals?filter=active" icon={TrendingUp} label="Active deals" paramKey="filter" paramValue="active" />
        <SidebarPanelLink href="/deals?filter=closed" icon={CheckCircle2} label="Closed" paramKey="filter" paramValue="closed" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <SidebarPanelLink href="/deals?sort=value" icon={BadgeDollarSign} label="By value" paramKey="sort" paramValue="value" />
        <SidebarPanelLink href="/deals?sort=date" icon={Clock} label="By date" paramKey="sort" paramValue="date" />
      </div>
    </SidebarPanelLayout>
  );
}

export function SidebarDocsPanel() {
  const session = useAuthSession();
  const organizationId = session.workspace.status === "ready" ? (session.workspace.organizationId ?? undefined) : undefined;
  const docsResult = useDocsQuery(organizationId);
  const recentDocs = [...(docsResult.data ?? [])]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 5);

  return (
    <SidebarPanelLayout
      title="Docs"
      primaryAction={
        <WorkspaceLink
          href="/docs?new=true"
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          New document
        </WorkspaceLink>
      }
    >
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/docs" icon={FileText} label="All docs" clearParams={["filter", "template"]} />
        <SidebarPanelLink href="/docs?filter=shared" icon={Share2} label="Shared with me" paramKey="filter" paramValue="shared" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <SidebarPanelLink href="/docs?filter=recent" icon={Clock} label="Recent" paramKey="filter" paramValue="recent" />
        <SidebarPanelLink href="/docs?template=true" icon={FileText} label="Templates" paramKey="template" paramValue="true" />
        <div className="mx-2 mt-3 border-t border-border/60 pt-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recently edited</p>
          <div className="space-y-0.5">
            {recentDocs.map((doc) => (
              <WorkspaceLink
                key={doc.id}
                href={`/docs/${doc.id}`}
                className="group flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-[var(--q-bg-tertiary)] hover:text-foreground"
              >
                <FileText className="size-3.5 shrink-0 opacity-70" />
                <span className="min-w-0 flex-1 truncate">{doc.title || "Untitled document"}</span>
              </WorkspaceLink>
            ))}
            {!docsResult.isLoading && recentDocs.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">No recent documents</p>
            ) : null}
          </div>
        </div>
      </div>
    </SidebarPanelLayout>
  );
}
