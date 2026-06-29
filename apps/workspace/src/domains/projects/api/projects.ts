"use client";

import {
  useWorkspaceIndexedResource,
  useWorkspacePagedResource,
  useWorkspaceResource,
  useWorkspaceResourceResult,
} from "@/domains/resources/workspace-resource-request";
import { createResourceApi } from "@/domains/resources/resource-api-factory";
import type { Project, ProjectStatus, ProjectHealth } from "../store/projects.types";
import type { ProjectFormValues } from "../validation/project.schema";

export const PROJECTS_PAGE_SIZE = 30;

type ProjectStats = {
  total: number;
  approved: number;
  pending: number;
  draft: number;
  rejected: number;
};

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

export function useProjectQuery(organizationId: string | undefined, projectId: string) {
  return useWorkspaceResource<Project | null>(
    ["project", organizationId, projectId],
    organizationId && projectId ? organizationId : undefined,
    `projects/${projectId}`,
  );
}

export function useProjectTaskCounts(organizationId?: string) {
  return useWorkspaceResource<Record<string, number>>(
    ["projects-task-counts", organizationId],
    organizationId,
    "projects/task-counts",
  );
}

function projectPayloadFromForm(values: ProjectFormValues) {
  return {
    name: values.name,
    clientId: values.clientId || undefined,
    opportunityId: values.opportunityId || undefined,
    status: values.status,
    health: values.health,
    visibility: values.visibility,
    startDate: values.startDate || undefined,
    endDate: values.endDate || undefined,
    budget: values.budget ? Number(values.budget) : undefined,
    description: values.description || undefined,
    tags: values.tags ?? [],
    templateId: values.templateId || undefined,
  };
}

export const projectApi = createResourceApi<{ id: string }, ProjectFormValues, ProjectFormValues>({
  resourcePath: "projects",
  resourceKey: "project",
  toPayload: projectPayloadFromForm,
});

export const createProjectRequest = projectApi.create;
export const updateProjectRequest = projectApi.update;
export const deleteProjectRequest = projectApi.remove;
