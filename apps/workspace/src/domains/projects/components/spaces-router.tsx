"use client";

import { useNavigation } from "@/domains/navigation";
import { SpacesListView } from "./spaces-list-view";
import { ProjectDetailOverview } from "./project-detail-overview";

export function SpacesRouter() {
  const { projectId } = useNavigation();

  if (projectId) {
    return <ProjectDetailOverview projectId={projectId} />;
  }

  return <SpacesListView />;
}
