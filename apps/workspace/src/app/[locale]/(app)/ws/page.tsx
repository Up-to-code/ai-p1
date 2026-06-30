"use client";

import { useSearchParams } from "next/navigation";
import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { OverviewView } from "./_pages/overview-view";
import { BoardView } from "./_pages/board-view";
import { TaskListView, TaskTableView, TaskTimelineView, TaskCalendarView } from "@/domains/projects/components/project-detail-overview";

export default function WsPage() {
  const searchParams = useSearchParams();
  const viewId = searchParams.get("view") ?? "overview";
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  switch (viewId) {
    case "board":
      return <BoardView />;
    case "list":
      return <TaskListView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
    case "table":
      return <TaskTableView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
    case "gantt":
      return <TaskTimelineView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
    case "calendar":
      return <TaskCalendarView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
    default:
      return <OverviewView />;
  }
}
