"use client";

import {
  ListTodo,
  CalendarDays,
  UserRound,
  KanbanSquare,
  BadgeDollarSign,
  FileText,
  CheckCircle2,
  Clock,
  Share2,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { SidebarPanelLink } from "./sidebar-panel-link";

export function SidebarTasksPanel() {
  return (
    <SidebarPanelLayout title="Tasks">
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/tasks" icon={ListTodo} label="All tasks" clearParams={["filter"]} />
        <SidebarPanelLink href="/tasks?filter=my" icon={UserRound} label="My tasks" paramKey="filter" paramValue="my" />
        <SidebarPanelLink href="/tasks?filter=assigned" icon={Share2} label="Assigned" paramKey="filter" paramValue="assigned" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <SidebarPanelLink href="/tasks?filter=completed" icon={CheckCircle2} label="Completed" paramKey="filter" paramValue="completed" />
        <SidebarPanelLink href="/tasks?filter=overdue" icon={Clock} label="Overdue" paramKey="filter" paramValue="overdue" />
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
      navbarActions={
        <WorkspaceLink
          href="/clients/create"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent/50 hover:text-text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
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

export function SidebarOpportunitiesPanel() {
  return (
    <SidebarPanelLayout title="Opportunities">
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/opportunities" icon={KanbanSquare} label="All opportunities" clearParams={["filter"]} />
        <SidebarPanelLink href="/opportunities?filter=won" icon={CheckCircle2} label="Won" paramKey="filter" paramValue="won" />
        <SidebarPanelLink href="/opportunities?filter=lost" icon={KanbanSquare} label="Lost" paramKey="filter" paramValue="lost" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <SidebarPanelLink href="/opportunities?filter=pipeline" icon={TrendingUp} label="Pipeline" paramKey="filter" paramValue="pipeline" />
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
  return (
    <SidebarPanelLayout
      title="Docs"
      navbarActions={
        <WorkspaceLink
          href="/docs?new=true"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent/50 hover:text-text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
        </WorkspaceLink>
      }
    >
      <div className="flex flex-col gap-2">
        <SidebarPanelLink href="/docs" icon={FileText} label="All docs" clearParams={["filter", "template"]} />
        <SidebarPanelLink href="/docs?filter=shared" icon={Share2} label="Shared with me" paramKey="filter" paramValue="shared" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <SidebarPanelLink href="/docs?filter=recent" icon={Clock} label="Recent" paramKey="filter" paramValue="recent" />
        <SidebarPanelLink href="/docs?template=true" icon={FileText} label="Templates" paramKey="template" paramValue="true" />
      </div>
    </SidebarPanelLayout>
  );
}
