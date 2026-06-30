"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { TaskListView } from "@/domains/projects/components/views/task-list-view";

export default function WsListViewPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  return <TaskListView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
}
