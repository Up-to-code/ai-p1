"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { TaskTableView } from "@/domains/projects/components/views/task-table-view";

export default function WsPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  return (
    <div className="p-4">
      <TaskTableView projectId={projectId ?? ""} organizationId={orgId ?? ""} />
    </div>
  );
}
