"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { ProjectFormValues } from "../validation/project.schema";

export function useProjectsQuery(organizationId?: string) {
  return useQuery(api.projects.read.list, organizationId ? { organizationId } : "skip");
}

export function useProjectQuery(organizationId: string | undefined, projectId: string) {
  return useQuery(
    api.projects.read.get,
    organizationId && projectId ? { organizationId, projectId: projectId as Id<"projects"> } : "skip",
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
