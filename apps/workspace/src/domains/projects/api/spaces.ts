"use client";

import {
  useWorkspaceResource,
  useWorkspaceResourceResult,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import type { SpaceFormValues } from "../validation/space.schema";

export interface Space {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  icon?: string;
  color?: string;
  visibility: "all_members" | "selected_members";
  defaultAssigneeIds?: string[];
  slug: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
}

export function useSpacesQuery(organizationId?: string, projectId?: string) {
  return useWorkspaceResource<Space[]>(
    ["spaces", organizationId, projectId],
    organizationId && projectId ? organizationId : undefined,
    `projects/${projectId}/spaces`,
  );
}

export function useSpaceOptionsQuery(organizationId?: string, projectId?: string) {
  return useWorkspaceResourceResult<{ id: string; name: string; slug: string; icon?: string; color?: string }[]>(
    ["spaces-options", organizationId, projectId],
    organizationId && projectId ? organizationId : undefined,
    `projects/${projectId}/spaces/options`,
  );
}

export function useSpaceQuery(organizationId?: string, projectId?: string, spaceId?: string) {
  return useWorkspaceResource<Space | null>(
    ["space", organizationId, projectId, spaceId],
    organizationId && projectId && spaceId ? organizationId : undefined,
    `projects/${projectId}/spaces/${spaceId}`,
  );
}

function spacePayloadFromForm(values: SpaceFormValues) {
  return {
    name: values.name,
    icon: values.icon || undefined,
    color: values.color || undefined,
    visibility: values.visibility,
    defaultAssigneeIds: values.defaultAssigneeIds ?? [],
    slug: values.slug,
  };
}

export async function createSpaceRequest(organizationId: string, projectId: string, values: SpaceFormValues) {
  return workspaceMutation<{ space: { id: string } }>(
    organizationId,
    `projects/${projectId}/spaces`,
    {
      method: "POST",
      body: spacePayloadFromForm(values),
      fallbackMessage: "Space request failed.",
    },
  );
}

export async function updateSpaceRequest(
  organizationId: string,
  projectId: string,
  spaceId: string,
  values: SpaceFormValues,
) {
  return workspaceMutation<{ space: { id: string } }>(
    organizationId,
    `projects/${projectId}/spaces/${spaceId}`,
    {
      method: "PATCH",
      body: spacePayloadFromForm(values),
      fallbackMessage: "Space request failed.",
    },
  );
}

export async function deleteSpaceRequest(organizationId: string, projectId: string, spaceId: string) {
  return workspaceMutation(
    organizationId,
    `projects/${projectId}/spaces/${spaceId}`,
    {
      method: "DELETE",
      fallbackMessage: "Space request failed.",
    },
  );
}
