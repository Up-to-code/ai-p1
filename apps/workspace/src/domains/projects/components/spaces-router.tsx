"use client";

import { useNavigation } from "@/domains/navigation";
import { SpacesListView } from "./spaces-list-view";
import { SpaceDetailView } from "./space-detail-view";
import { ProjectDetailOverview } from "./project-detail-overview";

export function SpacesRouter() {
  const { spaceSlug, projectId } = useNavigation();

  if (projectId) {
    return <ProjectDetailOverview projectId={projectId} />;
  }

  if (spaceSlug) {
    return <SpaceDetailView spaceSlug={spaceSlug} />;
  }

  return <SpacesListView />;
}
