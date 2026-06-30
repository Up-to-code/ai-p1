"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { TaskTimelineView } from "@/domains/projects/components/project-detail-overview";

export default function GanttPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);
  return <TaskTimelineView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
}
