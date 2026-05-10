"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { PropertyFormValues } from "../validation/property.schema";

export function usePropertiesQuery(organizationId?: string) {
  return useQuery(api.properties.read.list, organizationId ? { organizationId } : "skip");
}

export function usePropertyQuery(organizationId: string | undefined, propertyId: string) {
  return useQuery(
    api.properties.read.get,
    organizationId && propertyId ? { organizationId, propertyId: propertyId as Id<"propertyUnits"> } : "skip",
  );
}

export function propertyPayloadFromForm(values: PropertyFormValues) {
  return {
    title: values.title,
    projectId: values.projectId || undefined,
    project: values.project,
    city: values.city,
    type: values.type,
    status: values.status,
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
