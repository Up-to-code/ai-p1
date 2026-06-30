"use client";

import type React from "react";
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
  BarChart3,
  Plus,
} from "lucide-react";
import { usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLayout } from "./sidebar-panel-layout";

function PanelLink({
  href,
  icon: Icon,
  label,
  paramKey,
  paramValue,
  clearParams,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  paramKey?: string;
  paramValue?: string;
  clearParams?: string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathPart = href.split("?")[0];

  const isActive = pathname.startsWith(pathPart) && (
    paramKey
      ? searchParams.get(paramKey) === paramValue
      : clearParams
        ? clearParams.every((k) => !searchParams.has(k))
        : true
  );

  return (
    <WorkspaceLink
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </WorkspaceLink>
  );
}

export function SidebarTasksPanel() {
  return (
    <SidebarPanelLayout title="Tasks">
      <div className="flex flex-col gap-2">
        <PanelLink href="/tasks" icon={ListTodo} label="All tasks" clearParams={["filter"]} />
        <PanelLink href="/tasks?filter=my" icon={UserRound} label="My tasks" paramKey="filter" paramValue="my" />
        <PanelLink href="/tasks?filter=assigned" icon={Share2} label="Assigned" paramKey="filter" paramValue="assigned" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <PanelLink href="/tasks?filter=completed" icon={CheckCircle2} label="Completed" paramKey="filter" paramValue="completed" />
        <PanelLink href="/tasks?filter=overdue" icon={Clock} label="Overdue" paramKey="filter" paramValue="overdue" />
      </div>
    </SidebarPanelLayout>
  );
}

export function SidebarCalendarPanel() {
  return (
    <SidebarPanelLayout title="Calendar">
      <div className="flex flex-col gap-2">
        <PanelLink href="/calendar" icon={CalendarDays} label="Calendar" clearParams={["view", "filter"]} />
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
        <PanelLink href="/clients" icon={UserRound} label="All clients" clearParams={["filter", "sort"]} />
        <PanelLink href="/clients?filter=active" icon={Users} label="Active clients" paramKey="filter" paramValue="active" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <PanelLink href="/clients?sort=recent" icon={Clock} label="Recent" paramKey="sort" paramValue="recent" />
      </div>
    </SidebarPanelLayout>
  );
}

export function SidebarOpportunitiesPanel() {
  return (
    <SidebarPanelLayout title="Opportunities">
      <div className="flex flex-col gap-2">
        <PanelLink href="/opportunities" icon={KanbanSquare} label="All opportunities" clearParams={["filter"]} />
        <PanelLink href="/opportunities?filter=won" icon={CheckCircle2} label="Won" paramKey="filter" paramValue="won" />
        <PanelLink href="/opportunities?filter=lost" icon={KanbanSquare} label="Lost" paramKey="filter" paramValue="lost" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <PanelLink href="/opportunities?filter=pipeline" icon={TrendingUp} label="Pipeline" paramKey="filter" paramValue="pipeline" />
      </div>
    </SidebarPanelLayout>
  );
}

export function SidebarDealsPanel() {
  return (
    <SidebarPanelLayout title="Deals">
      <div className="flex flex-col gap-2">
        <PanelLink href="/deals" icon={BadgeDollarSign} label="All deals" clearParams={["filter", "sort"]} />
        <PanelLink href="/deals?filter=active" icon={TrendingUp} label="Active deals" paramKey="filter" paramValue="active" />
        <PanelLink href="/deals?filter=closed" icon={CheckCircle2} label="Closed" paramKey="filter" paramValue="closed" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <PanelLink href="/deals?sort=value" icon={BadgeDollarSign} label="By value" paramKey="sort" paramValue="value" />
        <PanelLink href="/deals?sort=date" icon={Clock} label="By date" paramKey="sort" paramValue="date" />
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
        <PanelLink href="/docs" icon={FileText} label="All docs" clearParams={["filter", "template"]} />
        <PanelLink href="/docs?filter=shared" icon={Share2} label="Shared with me" paramKey="filter" paramValue="shared" />
        <div className="mx-4 my-2 h-px bg-border/50" />
        <PanelLink href="/docs?filter=recent" icon={Clock} label="Recent" paramKey="filter" paramValue="recent" />
        <PanelLink href="/docs?template=true" icon={FileText} label="Templates" paramKey="template" paramValue="true" />
      </div>
    </SidebarPanelLayout>
  );
}
