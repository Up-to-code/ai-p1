"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { TaskListView } from "@/domains/projects/components/project-detail-overview";

export default function ListPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);
  return <TaskListView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
}
