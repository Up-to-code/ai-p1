"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useDebouncedValue, useHttpIndexedPagedQuery, useHttpPagedQuery, useHttpQuery } from "@/components/shared/use-http-query";
import type { Client, ClientType } from "../store/clients.types";
import type { ClientFormValues } from "../validation/client.schema";

export const CLIENTS_PAGE_SIZE = 50;

type ClientStats = {
  total: number;
  active: number;
  inactive: number;
  buyers: number;
  tenants: number;
  investors: number;
  brokers: number;
  stages: Record<"new" | "qualified" | "viewing" | "negotiation" | "closed", number>;
};

export function useClientsQuery(organizationId?: string) {
  return useQuery(api.clients.read.list, organizationId ? { organizationId } : "skip");
}

export function useClientsPagedQuery(organizationId?: string, options?: { type?: ClientType; search?: string }) {
  const type = options?.type;
  const search = options?.search?.trim();
  const debouncedSearch = useDebouncedValue(search, 250);
  const params = useMemo(() => ({ type, search: debouncedSearch }), [debouncedSearch, type]);

  return useHttpPagedQuery(
    ["clients-paged", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/clients` : undefined,
    params,
    CLIENTS_PAGE_SIZE,
  );
}

export function useClientsIndexQuery(organizationId?: string, options?: { type?: ClientType; search?: string }) {
  const type = options?.type;
  const search = options?.search?.trim();
  const debouncedSearch = useDebouncedValue(search, 250);
  const params = useMemo(() => ({ type, search: debouncedSearch }), [debouncedSearch, type]);

  return useHttpIndexedPagedQuery<Client, ClientStats>(
    ["clients-index", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/clients/index` : undefined,
    organizationId ? `/api/v1/organizations/${organizationId}/read/clients` : undefined,
    params,
    CLIENTS_PAGE_SIZE,
  );
}

export function useClientStatsQuery(organizationId?: string) {
  return useHttpQuery<ClientStats>(
    ["clients-stats", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/clients/stats` : undefined,
  );
}

export function useClientOptionsQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useHttpQuery<{ id: string; name: string }[]>(
    ["clients-options", organizationId],
    organizationId && options.enabled !== false ? `/api/v1/organizations/${organizationId}/read/clients/options` : undefined,
  );
}

export function useClientQuery(organizationId: string | undefined, clientId: string) {
  return useQuery(
    api.clients.read.get,
    organizationId && clientId ? { organizationId, clientId: clientId as Id<"clients"> } : "skip",
  );
}

export function useClientUnitLinksQuery(organizationId: string | undefined, clientId: string | undefined) {
  return useQuery(
    api.clients.read.listUnitLinks,
    organizationId && clientId ? { organizationId, clientId: clientId as Id<"clients"> } : "skip",
  );
}

export function usePropertyClientLinksQuery(organizationId: string | undefined, propertyId: string | undefined) {
  return useQuery(
    api.clients.read.listUnitLinksForProperty,
    organizationId && propertyId ? { organizationId, propertyId: propertyId as Id<"propertyUnits"> } : "skip",
  );
}

export function clientPayloadFromForm(values: ClientFormValues) {
  return {
    name: values.name,
    type: values.type,
    contact: values.contact,
    phone: values.phone,
    age: Number(values.age || 0),
    nationality: values.nationality,
    generation: values.generation,
    budget: values.budget,
    propertyInterest: values.propertyInterest,
    status: values.status,
    visibility: values.visibility ?? "private",
    pipelineStage: values.pipelineStage,
    priority: values.priority,
    nextAction: values.nextAction,
    issue: values.issue || undefined,
  };
}

async function jsonOrThrow(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Client request failed.");
  }
  return payload;
}

export async function createClientRequest(organizationId: string, values: ClientFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/clients`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(clientPayloadFromForm(values)),
  });
  return jsonOrThrow(response) as Promise<{ client: { id: string } }>;
}

export async function updateClientRequest(organizationId: string, clientId: string, values: ClientFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/clients/${clientId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(clientPayloadFromForm(values)),
  });
  return jsonOrThrow(response) as Promise<{ client: { id: string } }>;
}

export async function deleteClientRequest(organizationId: string, clientId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/clients/${clientId}`, {
    method: "DELETE",
  });
  return jsonOrThrow(response);
}

export async function linkClientUnitRequest(organizationId: string, clientId: string, propertyId: string, status = "interested", notes?: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/clients/${clientId}/units`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ propertyId, status, notes: notes?.trim() || undefined }),
  });
  return jsonOrThrow(response);
}

export async function unlinkClientUnitRequest(organizationId: string, clientId: string, propertyId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/clients/${clientId}/units/${propertyId}`, {
    method: "DELETE",
  });
  return jsonOrThrow(response);
}
