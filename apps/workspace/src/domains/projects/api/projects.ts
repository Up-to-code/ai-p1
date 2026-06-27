"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import {
  useWorkspaceIndexedResource,
  useWorkspacePagedResource,
  useWorkspaceResource,
  useWorkspaceResourceResult,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import { useToast } from "@/components/ui/toast";
import type { ProjectStatus, ProjectHealth } from "../store/projects.types";
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
    tags: values.tags ?? [],
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

function projectsIndexQueryBaseKey(organizationId?: string) {
  return ["projects-index", organizationId] as const;
}

export function useUpdateProjectOptimisticMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      projectId,
      values,
    }: {
      organizationId: string;
      projectId: string;
      values: Partial<ProjectFormValues>;
    }) => updateProjectRequest(organizationId, projectId, values as ProjectFormValues),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<{ items: Project[] } | undefined>(
        queryKey,
        (data) => {
          if (!data) return data;
          return {
            ...data,
            items: data.items.map((p) =>
              p.id === variables.projectId
                ? { ...p, ...variables.values, updatedAt: Date.now() } as Project
                : p,
            ),
          };
        },
      );
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Project update failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      toast({ title: "Project saved.", type: "success" });
      void queryClient.invalidateQueries({ queryKey: projectsIndexQueryBaseKey(variables.organizationId) });
    },
  });
}

export function useDeleteProjectOptimisticMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ organizationId, projectId }: { organizationId: string; projectId: string }) =>
      deleteProjectRequest(organizationId, projectId),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<{ items: Project[] } | undefined>(
        queryKey,
        (data) => {
          if (!data) return data;
          return {
            ...data,
            items: data.items.filter((p) => p.id !== variables.projectId),
          };
        },
      );
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Project delete failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      toast({ title: "Project deleted.", type: "success" });
      void queryClient.invalidateQueries({ queryKey: projectsIndexQueryBaseKey(variables.organizationId) });
    },
  });
}
