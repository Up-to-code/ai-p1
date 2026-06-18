"use client";

import { use } from "react";
import { TasksScreen } from "@/domains/tasks/components/tasks-screen";

export default function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  return <TasksScreen projectId={projectId} hideShell />;
}
