"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useDebouncedValue, useHttpIndexedPagedQuery, useHttpPagedQuery, useHttpQuery } from "@/components/shared/use-http-query";
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
  const status = options?.status;
  const search = options?.search?.trim();
  const debouncedSearch = useDebouncedValue(search, 250);
  const params = useMemo(() => ({ status, search: debouncedSearch }), [debouncedSearch, status]);

  return useHttpPagedQuery(
    ["properties-paged", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/properties` : undefined,
    params,
    PROPERTIES_PAGE_SIZE,
  );
}

export function usePropertiesIndexQuery(organizationId?: string, options?: { status?: PropertyStatus; search?: string }) {
  const status = options?.status;
  const search = options?.search?.trim();
  const debouncedSearch = useDebouncedValue(search, 250);
  const params = useMemo(() => ({ status, search: debouncedSearch }), [debouncedSearch, status]);

  return useHttpIndexedPagedQuery<PropertyUnit, PropertyStats>(
    ["properties-index", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/properties/index` : undefined,
    organizationId ? `/api/v1/organizations/${organizationId}/read/properties` : undefined,
    params,
    PROPERTIES_PAGE_SIZE,
  );
}

export function useProjectPropertiesQuery(organizationId: string | undefined, projectId: string | undefined) {
  return useHttpQuery<PropertyUnit[]>(
    ["properties-by-project", organizationId, projectId],
    organizationId && projectId ? `/api/v1/organizations/${organizationId}/read/properties/by-project/${projectId}` : undefined,
  );
}

export function usePropertyStatsQuery(organizationId?: string) {
  return useHttpQuery<PropertyStats>(
    ["properties-stats", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/properties/stats` : undefined,
  );
}

export function usePropertyOptionsQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useHttpQuery<{ id: string; title: string }[]>(
    ["properties-options", organizationId],
    organizationId && options.enabled !== false ? `/api/v1/organizations/${organizationId}/read/properties/options` : undefined,
  );
}

export function usePropertyQuery(organizationId: string | undefined, propertyId: string) {
  return useHttpQuery<PropertyUnit | null>(
    ["property", organizationId, propertyId],
    organizationId && propertyId ? `/api/v1/organizations/${organizationId}/read/properties/${propertyId}` : undefined,
  );
}

export function propertyPayloadFromForm(values: PropertyFormValues) {
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

async function jsonOrThrow(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Property request failed.");
  }
  return payload;
}

export async function createPropertyRequest(organizationId: string, values: PropertyFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/properties`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(propertyPayloadFromForm(values)),
  });
  return jsonOrThrow(response) as Promise<{ property: { id: string } }>;
}

export async function updatePropertyRequest(organizationId: string, propertyId: string, values: PropertyFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/properties/${propertyId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(propertyPayloadFromForm(values)),
  });
  return jsonOrThrow(response) as Promise<{ property: { id: string } }>;
}

export async function deletePropertyRequest(organizationId: string, propertyId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/properties/${propertyId}`, {
    method: "DELETE",
  });
  return jsonOrThrow(response);
}
