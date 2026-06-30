"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { TaskTableView } from "@/domains/projects/components/views/task-table-view";

export default function WsTableViewPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  return <TaskTableView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
}
