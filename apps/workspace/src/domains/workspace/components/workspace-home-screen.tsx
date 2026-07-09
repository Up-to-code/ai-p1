"use client";

import { useNavigation } from "@/domains/navigation";
import { TaskTableView } from "@/domains/projects/components/views/task-table-view";

export function WorkspaceHomeScreen() {
  const { orgId, projectId } = useNavigation();

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--q-bg)]">
      <section className="min-h-0 flex-1 overflow-hidden">
        <TaskTableView projectId={projectId ?? ""} organizationId={orgId ?? ""} />
      </section>
    </div>
  );
}
