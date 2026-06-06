"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  useWorkspaceIndexedResource,
  useWorkspacePagedResource,
  useWorkspaceResource,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import type { PropertyStatus } from "../store/properties.types";
import type { PropertyUnit } from "../store/properties.types";
import type { PropertyFormValues } from "../validation/property.schema";

export const PROPERTIES_PAGE_SIZE = 30;

type PropertyStats = {
  total: number;
  available: number;
  pending: number;
  reserved: number;
  sold: number;
  draft: number;
};

export function usePropertiesQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useQuery(
    api.properties.read.list,
    organizationId && options.enabled !== false ? { organizationId } : "skip",
  );
}

export function usePropertiesPagedQuery(organizationId?: string, options?: { status?: PropertyStatus; search?: string }) {
  return useWorkspacePagedResource(
    ["properties-paged", organizationId],
    organizationId,
    "properties",
    { status: options?.status, search: options?.search },
    PROPERTIES_PAGE_SIZE,
  );
}

export function usePropertiesIndexQuery(organizationId?: string, options?: { status?: PropertyStatus; search?: string }) {
  return useWorkspaceIndexedResource<PropertyUnit, PropertyStats>(
    ["properties-index", organizationId],
    organizationId,
    "properties/index",
    "properties",
    { status: options?.status, search: options?.search },
    PROPERTIES_PAGE_SIZE,
  );
}

export function useProjectPropertiesQuery(organizationId: string | undefined, projectId: string | undefined) {
  return useWorkspaceResource<PropertyUnit[]>(
    ["properties-by-project", organizationId, projectId],
    organizationId && projectId ? organizationId : undefined,
    `properties/by-project/${projectId}`,
  );
}

export function usePropertyOptionsQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useWorkspaceResource<{ id: string; title: string }[]>(
    ["properties-options", organizationId],
    organizationId && options.enabled !== false ? organizationId : undefined,
    "properties/options",
  );
}

export function usePropertyQuery(organizationId: string | undefined, propertyId: string) {
  return useWorkspaceResource<PropertyUnit | null>(
    ["property", organizationId, propertyId],
    organizationId && propertyId ? organizationId : undefined,
    `properties/${propertyId}`,
  );
}

function propertyPayloadFromForm(values: PropertyFormValues) {
  return {
    title: values.title,
    projectId: values.projectId || undefined,
    project: values.project?.trim() || "Standalone unit",
    city: values.city,
    type: values.type,
    status: values.status,
    visibility: values.visibility ?? "private",
    purpose: values.purpose,
    price: values.price,
    area: values.area,
    bedrooms: Number(values.bedrooms || 0),
    bathrooms: Number(values.bathrooms || 0),
    description: values.description,
  };
}

export async function createPropertyRequest(organizationId: string, values: PropertyFormValues) {
  return workspaceMutation<{ property: { id: string } }>(organizationId, "properties", {
    method: "POST",
    body: propertyPayloadFromForm(values),
    fallbackMessage: "Property request failed.",
  });
}

export async function updatePropertyRequest(organizationId: string, propertyId: string, values: PropertyFormValues) {
  return workspaceMutation<{ property: { id: string } }>(organizationId, `properties/${propertyId}`, {
    method: "PATCH",
    body: propertyPayloadFromForm(values),
    fallbackMessage: "Property request failed.",
  });
}

export async function deletePropertyRequest(organizationId: string, propertyId: string) {
  return workspaceMutation(organizationId, `properties/${propertyId}`, {
    method: "DELETE",
    fallbackMessage: "Property request failed.",
  });
}
