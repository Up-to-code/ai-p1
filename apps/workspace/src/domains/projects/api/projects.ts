"use client";

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
    templateId: values.templateId || undefined,
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
