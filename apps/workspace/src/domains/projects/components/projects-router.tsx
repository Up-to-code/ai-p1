"use client";

import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { ProjectListView } from "./project-list-view";
import { ProjectDetailOverview } from "./project-detail-overview";

export function ProjectsRouter() {
  const activeProjectId = useCurrentProjectId();

  if (activeProjectId) {
    return <ProjectDetailOverview projectId={activeProjectId} />;
  }

  return <ProjectListView />;
}
