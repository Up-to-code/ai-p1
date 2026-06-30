"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { TaskCalendarView } from "@/domains/projects/components/views/task-calendar-view";

export default function WsCalendarPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  return <TaskCalendarView projectId={projectId ?? ""} organizationId={orgId ?? ""} />;
}
