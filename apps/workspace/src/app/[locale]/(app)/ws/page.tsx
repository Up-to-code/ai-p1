"use client";

import { useNavigation } from "@/domains/navigation";
import { TaskTableView } from "@/domains/projects/components/views/task-table-view";

export default function WsPage() {
  const { orgId, projectId } = useNavigation();

  return (
    <div className="p-4">
      <TaskTableView projectId={projectId ?? ""} organizationId={orgId ?? ""} />
    </div>
  );
}
