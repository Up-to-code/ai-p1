"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useHttpPagedQuery, useHttpQuery } from "@/components/shared/use-http-query";
import type { ProjectStatus } from "../store/projects.types";
import type { Project } from "../store/projects.types";
import type { ProjectFormValues } from "../validation/project.schema";

export const PROJECTS_PAGE_SIZE = 30;

export function useProjectsQuery(organizationId?: string) {
  return useQuery(api.projects.read.list, organizationId ? { organizationId } : "skip");
}

export function useProjectsPagedQuery(organizationId?: string, options?: { status?: ProjectStatus; search?: string }) {
  const status = options?.status;
  const search = options?.search?.trim();
  const params = useMemo(() => ({ status, search }), [search, status]);

  return useHttpPagedQuery(
    ["projects-paged", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/projects` : undefined,
    params,
    PROJECTS_PAGE_SIZE,
  );
}

export function useProjectStatsQuery(organizationId?: string) {
  return useHttpQuery<{ total: number; approved: number; pending: number; draft: number; rejected: number }>(
    ["projects-stats", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/projects/stats` : undefined,
  );
}

export function useProjectQuery(organizationId: string | undefined, projectId: string) {
  return useHttpQuery<Project | null>(
    ["project", organizationId, projectId],
    organizationId && projectId ? `/api/v1/organizations/${organizationId}/read/projects/${projectId}` : undefined,
  );
}

export function projectPayloadFromForm(values: ProjectFormValues) {
  return {
    name: values.name,
    developer: values.developer,
    city: values.city,
    area: values.area,
    type: values.type,
    unitTypes: values.unitTypes,
    status: values.status,
    units: Number(values.units || 0),
    priceRange: values.priceRange,
    description: values.description,
  };
}

async function jsonOrThrow(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Project request failed.");
  }
  return payload;
}

export async function createProjectRequest(organizationId: string, values: ProjectFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(projectPayloadFromForm(values)),
  });
  return jsonOrThrow(response) as Promise<{ project: { id: string } }>;
}

export async function updateProjectRequest(organizationId: string, projectId: string, values: ProjectFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/projects/${projectId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(projectPayloadFromForm(values)),
  });
  return jsonOrThrow(response) as Promise<{ project: { id: string } }>;
}

export async function deleteProjectRequest(organizationId: string, projectId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/projects/${projectId}`, {
    method: "DELETE",
  });
  return jsonOrThrow(response);
}
