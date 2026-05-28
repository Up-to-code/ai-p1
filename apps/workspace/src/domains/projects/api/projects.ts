"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  useWorkspaceIndexedResource,
  useWorkspacePagedResource,
  useWorkspaceResource,
  useWorkspaceResourceResult,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import type { ProjectStatus } from "../store/projects.types";
import type { Project } from "../store/projects.types";
import type { ProjectFormValues } from "../validation/project.schema";

export const PROJECTS_PAGE_SIZE = 30;

type ProjectStats = {
  total: number;
  approved: number;
  pending: number;
  draft: number;
  rejected: number;
};

export function useProjectsQuery(organizationId?: string) {
  return useQuery(api.projects.read.list, organizationId ? { organizationId } : "skip");
}

export function useProjectsPagedQuery(organizationId?: string, options?: { status?: ProjectStatus; search?: string }) {
  return useWorkspacePagedResource(
    ["projects-paged", organizationId],
    organizationId,
    "projects",
    { status: options?.status, search: options?.search },
    PROJECTS_PAGE_SIZE,
  );
}

export function useProjectsIndexQuery(organizationId?: string, options?: { status?: ProjectStatus; search?: string }) {
  return useWorkspaceIndexedResource<Project, ProjectStats>(
    ["projects-index", organizationId],
    organizationId,
    "projects/index",
    "projects",
    { status: options?.status, search: options?.search },
    PROJECTS_PAGE_SIZE,
  );
}

export function useProjectOptionsQueryResult(organizationId?: string, options?: { limit?: number }) {
  return useWorkspaceResourceResult<{ id: string; name: string }[]>(
    ["projects-options", organizationId],
    organizationId,
    "projects/options",
    { limit: options?.limit ?? 200 },
  );
}

export function useProjectOptionsQuery(organizationId?: string) {
  return useWorkspaceResource<{ id: string; name: string }[]>(
    ["projects-options", organizationId],
    organizationId,
    "projects/options",
  );
}

export function useProjectStatsQuery(organizationId?: string) {
  return useWorkspaceResource<ProjectStats>(
    ["projects-stats", organizationId],
    organizationId,
    "projects/stats",
  );
}

export function useProjectQuery(organizationId: string | undefined, projectId: string) {
  return useWorkspaceResource<Project | null>(
    ["project", organizationId, projectId],
    organizationId && projectId ? organizationId : undefined,
    `projects/${projectId}`,
  );
}

export function projectPayloadFromForm(values: ProjectFormValues) {
  const projectPrices = (values.projectPrices ?? [])
    .map((item) => ({
      id: item.id,
      label: item.label.trim(),
      price: item.price.trim(),
    }))
    .filter((item) => item.label || item.price);
  const projectPriceDisplay = projectPrices.map((item) => item.price).filter(Boolean).join(" - ");
  const priceRange = projectPriceDisplay || values.averagePrice.trim();

  return {
    name: values.name,
    developer: values.developer,
    city: values.city,
    area: values.area,
    type: values.type,
    unitTypes: values.unitTypes,
    status: values.status,
    visibility: values.visibility ?? "private",
    units: Number(values.units || 0),
    averagePrice: values.averagePrice,
    projectPrices,
    priceRange,
    regaAuthorizationNo: values.regaAuthorizationNo || undefined,
    regaExpiresAt: values.regaExpiresAt || undefined,
    planNumber: values.planNumber || undefined,
    plotNumber: values.plotNumber || undefined,
    postalIdentity: values.postalIdentity || undefined,
    description: values.description,
  };
}

export async function createProjectRequest(organizationId: string, values: ProjectFormValues) {
  return workspaceMutation<{ project: { id: string } }>(organizationId, "projects", {
    method: "POST",
    body: projectPayloadFromForm(values),
    fallbackMessage: "Project request failed.",
  });
}

export async function updateProjectRequest(organizationId: string, projectId: string, values: ProjectFormValues) {
  return workspaceMutation<{ project: { id: string } }>(organizationId, `projects/${projectId}`, {
    method: "PATCH",
    body: projectPayloadFromForm(values),
    fallbackMessage: "Project request failed.",
  });
}

export async function deleteProjectRequest(organizationId: string, projectId: string) {
  return workspaceMutation(organizationId, `projects/${projectId}`, {
    method: "DELETE",
    fallbackMessage: "Project request failed.",
  });
}
