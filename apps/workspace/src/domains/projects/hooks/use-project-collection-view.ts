"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/domains/auth";
import { useProjectsIndexQuery } from "../api/projects";
import { useProjectWorkspaceSurface } from "../api/project-workspace";
import {
  defaultProjectViewConfig,
  type ProjectViewType,
} from "../workspace/project-workspace";
import type { Project, ProjectStatus } from "../store/projects.types";

const PROJECT_STATUSES = new Set<ProjectStatus>([
  "planned",
  "active",
  "paused",
  "completed",
  "archived",
]);
const PROJECT_SORT_FIELDS = new Set<keyof Project>([
  "name",
  "status",
  "health",
  "progress",
  "startDate",
  "endDate",
  "budget",
  "currency",
  "ownerUserId",
  "createdAt",
  "updatedAt",
]);

function configuredStatus(config: ReturnType<typeof defaultProjectViewConfig>) {
  const filter = config.filters?.find((item) => item.field === "status" && item.operator === "equals");
  return typeof filter?.value === "string" && PROJECT_STATUSES.has(filter.value as ProjectStatus)
    ? (filter.value as ProjectStatus)
    : undefined;
}

function sortProjects(projects: Project[], sortBy?: string, direction?: "asc" | "desc") {
  const factor = direction === "asc" ? 1 : -1;
  return [...projects].sort((left, right) => {
    const leftValue = left[sortBy as keyof Project];
    const rightValue = right[sortBy as keyof Project];
    if (typeof leftValue === "number" && typeof rightValue === "number") return (leftValue - rightValue) * factor;
    return String(leftValue ?? "").localeCompare(String(rightValue ?? "")) * factor;
  });
}

export function useProjectCollectionView(
  viewType: ProjectViewType,
  savedViewId?: string,
) {
  const session = useAuthSession();
  const params = useSearchParams();
  const organizationId = session.workspace.organizationId ?? undefined;
  const surface = useProjectWorkspaceSurface(organizationId);
  const tab = surface.data?.tabs.find((candidate) =>
    savedViewId
      ? candidate.savedView.id === savedViewId
      : candidate.savedView.isSystemDefault && candidate.savedView.viewType === viewType,
  );
  const config = tab?.savedView.config ?? defaultProjectViewConfig(viewType);
  const queryStatus = params.get("status");
  const status = queryStatus && PROJECT_STATUSES.has(queryStatus as ProjectStatus)
    ? (queryStatus as ProjectStatus)
    : configuredStatus(config);
  const search = params.get("search") ?? config.search;
  const requestedSort = params.get("sort");
  const sortBy = requestedSort && PROJECT_SORT_FIELDS.has(requestedSort as keyof Project)
    ? requestedSort
    : config.sortBy;
  const requestedDirection = params.get("direction");
  const sortDirection = requestedDirection === "asc" || requestedDirection === "desc"
    ? requestedDirection
    : config.sortDirection;
  const projectsQuery = useProjectsIndexQuery(organizationId, { status, search });
  const projects = useMemo(
    () => sortProjects(projectsQuery.results, sortBy, sortDirection),
    [projectsQuery.results, sortBy, sortDirection],
  );
  return {
    organizationId,
    tab,
    config,
    projects,
    search: search ?? "",
    filterStatus: status,
    sortBy,
    sortDirection: sortDirection ?? "desc",
    status: projectsQuery.status,
    queryStatus: projectsQuery.queryStatus,
    errorMessage: projectsQuery.errorMessage,
    loadMore: projectsQuery.loadMore,
  };
}
