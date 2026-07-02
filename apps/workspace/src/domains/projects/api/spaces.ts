"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  useWorkspaceResource,
  useWorkspaceResourceResult,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import type { SpaceFormValues } from "../validation/space.schema";

export interface Space {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility: "private" | "public" | "request_only";
  defaultProjectVisibility?: "private" | "space_members" | "organization";
  allowMemberProjectCreation?: boolean;
  slug: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
}

export function useWorkspaceSpacesQuery(organizationId?: string) {
  const result = useQuery(
    api.spaces.read.listAccessible,
    organizationId ? { organizationId } : "skip",
  );
  return result ?? undefined;
}

export function useSpacesQuery(organizationId?: string, projectId?: string) {
  // TODO: Update to use new organization-level spaces when project-specific spaces are migrated
  return useWorkspaceResource<Space[]>(
    ["spaces", organizationId, projectId],
    organizationId && projectId ? organizationId : undefined,
    `projects/${projectId}/spaces`,
  );
}

export function useSpaceOptionsQuery(organizationId?: string) {
  const result = useQuery(
    api.spaces.read.options,
    organizationId ? { organizationId } : "skip",
  );
  return result ?? undefined;
}

export function useSpaceQuery(organizationId?: string, spaceId?: string) {
  const result = useQuery(
    api.spaces.read.getBySlug,
    organizationId && spaceId ? { organizationId, slug: spaceId } : "skip",
  );
  return result ?? undefined;
}

function spacePayloadFromForm(values: SpaceFormValues) {
  return {
    name: values.name,
    description: values.description,
    icon: values.icon || undefined,
    color: values.color || undefined,
    visibility: values.visibility,
    defaultProjectVisibility: values.defaultProjectVisibility,
    allowMemberProjectCreation: values.allowMemberProjectCreation,
    slug: values.slug,
  };
}

export async function createSpaceRequest(organizationId: string, values: SpaceFormValues) {
  return workspaceMutation<{ space: { id: string } }>(
    organizationId,
    `spaces`,
    {
      method: "POST",
      body: spacePayloadFromForm(values),
      fallbackMessage: "Space request failed.",
    },
  );
}

export async function updateSpaceRequest(
  organizationId: string,
  spaceId: string,
  values: SpaceFormValues,
) {
  return workspaceMutation<{ space: { id: string } }>(
    organizationId,
    `spaces/${spaceId}`,
    {
      method: "PATCH",
      body: spacePayloadFromForm(values),
      fallbackMessage: "Space request failed.",
    },
  );
}

export async function deleteSpaceRequest(organizationId: string, spaceId: string) {
  return workspaceMutation(
    organizationId,
    `spaces/${spaceId}`,
    {
      method: "DELETE",
      fallbackMessage: "Space request failed.",
    },
  );
}
