"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Settings, Brain, Share2, Zap } from "lucide-react";
import { WorkspaceTabSwitcher } from "./workspace-tab-switcher";
import { WorkspaceWidgetGrid } from "./workspace-widget-grid";
import { useAccountContext } from "@/domains/auth";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useNavigation } from "@/domains/navigation";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { cn } from "@/lib/utils";

// Import reusable views from project-detail-overview
import { 
  TaskTableView, 
  TaskListView, 
  TaskBoardView, 
  TaskCalendarView, 
  TaskTimelineView 
} from "@/domains/projects/components/project-detail-overview";

// Import dashboard widgets
import { 
  MetricCards, 
  FoldersWidget, 
  PortfolioWidget, 
  CalendarTodayWidget, 
  RecentConversationsWidget, 
  DocsWidget, 
  AiBrainWidget 
} from "./workspace-widgets";

// Re-export widgets for any external consumers
export { 
  MetricCards, 
  FoldersWidget, 
  PortfolioWidget, 
  CalendarTodayWidget, 
  RecentConversationsWidget, 
  DocsWidget, 
  AiBrainWidget 
} from "./workspace-widgets";

// ── Main Export ──



function WorkspaceHeader() {
  const { spaceSlug, projectId } = useNavigation();
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const spaces = useWorkspaceSpacesQuery(orgId);
  const projectsResult = useProjectsIndexQuery(orgId);
  const projects = projectsResult?.results ?? [];

  const currentSpace = spaces?.find((s) => s.slug === spaceSlug);
  const currentProject = projects.find((p) => p.id === projectId);

  let title = "All Spaces Overview";
  if (currentProject) {
    title = currentProject.name;
  } else if (currentSpace) {
    title = currentSpace.name;
  }

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-transparent">
      <div className="flex items-center gap-2">
        <div className="w-[18px] h-[18px] rounded overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#7c3aed] via-[#2563eb] to-[#06b6d4] shrink-0">
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[10px] h-[10px]">
            <path d="M2 8.5 L6 4 L10 8.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <span className="text-[14px] font-semibold text-foreground tracking-tight">{title}</span>
        <span className="text-muted-foreground text-[10px] ml-0.5">▼</span>
        <span className="text-[#a855f7] text-[12px] ml-1.5 flex items-center gap-0.5">★ <span className="w-1 h-1 rounded-full bg-[#a855f7]"></span></span>
        <span className="text-muted-foreground text-[10px] ml-1">▼</span>
      </div>
      
      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <span className="text-[15px] leading-none">∞</span>
          <span className="text-[12px] font-medium">Agents</span>
        </div>
        <div className="hover:text-foreground cursor-pointer transition-colors">
          <Zap className="w-[14px] h-[14px]" />
        </div>
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Brain className="w-[14px] h-[14px]" />
          <span className="text-[12px] font-medium">Brain²</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Share2 className="w-[14px] h-[14px]" />
          <span className="text-[12px] font-medium">Share</span>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceScreen() {
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { spaceSlug, projectId } = useNavigation();
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const spaces = useWorkspaceSpacesQuery(orgId);
  const activeSpace = spaces?.find((s) => s.slug === spaceSlug);

  // Set the active project for filtered lists:
  const activeProjectId = projectId || activeSpace?.projectId || "";

  return (
    <div className="flex h-full bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <WorkspaceHeader />
        <WorkspaceTabSwitcher activeTab={activeTab} onChangeTab={setActiveTab} />
        <div className={cn("flex-1 overflow-y-auto", activeTab === "table" ? "p-0" : "p-6")}>
          {activeTab === "overview" && (
            <WorkspaceWidgetGrid
              isWidgetModalOpen={isWidgetModalOpen}
              onWidgetModalClose={() => setIsWidgetModalOpen(false)}
            />
          )}
          {activeTab === "table" && (
            <TaskTableView projectId={activeProjectId} organizationId={orgId ?? ""} />
          )}
          {activeTab === "list" && (
            <TaskListView projectId={activeProjectId} organizationId={orgId ?? ""} />
          )}
          {activeTab === "board" && (
            <TaskBoardView projectId={activeProjectId} organizationId={orgId ?? ""} />
          )}
          {activeTab === "calendar" && (
            <TaskCalendarView projectId={activeProjectId} organizationId={orgId ?? ""} />
          )}
          {activeTab === "gantt" && (
            <TaskTimelineView projectId={activeProjectId} organizationId={orgId ?? ""} />
          )}
        </div>
      </div>
    </div>
  );
}
