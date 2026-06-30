"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { TaskTimelineView } from "@/domains/projects/components/views/task-timeline-view";

export default function WsGanttPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  return <TaskTimelineView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
}
