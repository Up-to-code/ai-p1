"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useDebouncedValue, useHttpIndexedPagedQuery, useHttpPagedQuery, useHttpQuery, type IndexedInfinitePage } from "@/components/shared/use-http-query";
import { useToast } from "@/components/ui/toast";
import type { Client, ClientType } from "../store/clients.types";
import type { ClientFormValues } from "../validation/client.schema";
import { nextPipelineOrder, type PipelineOrderClient } from "../pipeline-order";

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

type ClientsIndexData = InfiniteData<IndexedInfinitePage<Client, ClientStats>, string | null>;
type PipelineStage = Client["pipelineStage"];
type ActivePipelineStage = Exclude<PipelineStage, "closed">;

export function clientsIndexQueryBaseKey(organizationId?: string) {
  return ["clients-index", organizationId] as const;
}

function clientFormValues(client: Client, stage: PipelineStage, pipelineOrder?: number): ClientFormValues {
  return {
    name: client.name,
    type: client.type,
    contact: client.contact,
    phone: client.phone,
    age: String(client.age),
    nationality: client.nationality,
    generation: client.generation,
    budget: client.budget,
    propertyInterest: client.propertyInterest,
    status: client.status,
    visibility: client.visibility ?? "private",
    pipelineStage: stage,
    pipelineOrder,
    priority: client.priority,
    nextAction: client.nextAction,
    issue: client.issue ?? "",
  };
}

function patchClientInIndexData(data: ClientsIndexData | undefined, clientId: string, patch: Partial<Client>) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      list: {
        ...page.list,
        page: page.list.page.map((client) => (
          client.id === clientId ? { ...client, ...patch } : client
        )),
      },
    })),
  } satisfies ClientsIndexData;
}

function removeClientFromIndexData(data: ClientsIndexData | undefined, clientId: string) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      list: {
        ...page.list,
        page: page.list.page.filter((client) => client.id !== clientId),
      },
    })),
  } satisfies ClientsIndexData;
}

export function useUpdateClientOptimisticMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      client,
      values,
    }: {
      organizationId: string;
      client: Client;
      values: ClientFormValues;
    }) => updateClientRequest(organizationId, client.id, values),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ClientsIndexData>(queryKey);

      queryClient.setQueryData<ClientsIndexData>(
        queryKey,
        (data) => patchClientInIndexData(data, variables.client.id, {
          ...clientPayloadFromForm(variables.values),
          age: Number(variables.values.age || 0),
          updatedAt: Date.now(),
        }),
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Client update failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      toast({ title: "Client saved.", type: "success" });
      void queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(variables.organizationId) });
    },
  });
}

export function useDeleteClientOptimisticMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ organizationId, clientId }: { organizationId: string; clientId: string }) =>
      deleteClientRequest(organizationId, clientId),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ClientsIndexData>(queryKey);

      queryClient.setQueryData<ClientsIndexData>(
        queryKey,
        (data) => removeClientFromIndexData(data, variables.clientId),
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Client delete failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      toast({ title: "Client deleted.", type: "success" });
      void queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(variables.organizationId) });
    },
  });
}

export function useMoveClientInPipelineMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      client,
      stage,
      stageClients,
      targetIndex,
    }: {
      organizationId: string;
      client: Client;
      stage: ActivePipelineStage;
      stageClients: PipelineOrderClient[];
      targetIndex: number;
    }) => {
      const pipelineOrder = nextPipelineOrder(stageClients, client.id, targetIndex);
      return updateClientRequest(organizationId, client.id, clientFormValues(client, stage, pipelineOrder));
    },
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ClientsIndexData>(queryKey);
      const pipelineOrder = nextPipelineOrder(variables.stageClients, variables.client.id, variables.targetIndex);

      queryClient.setQueryData<ClientsIndexData>(
        queryKey,
        (data) => patchClientInIndexData(data, variables.client.id, {
          pipelineStage: variables.stage,
          pipelineOrder,
          updatedAt: Date.now(),
        }),
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Move failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(variables.organizationId) });
    },
  });
}

export function useClientsQuery(organizationId?: string) {
  return useQuery(api.clients.read.list, organizationId ? { organizationId } : "skip");
}

export function useClientsPagedQuery(organizationId?: string, options?: { type?: ClientType; search?: string }) {
  const type = options?.type;
  const search = options?.search?.trim();
  const debouncedSearch = useDebouncedValue(search, 250);
  const params = useMemo(() => ({ type, search: debouncedSearch }), [debouncedSearch, type]);

  return useHttpPagedQuery<Client>(
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
    clientsIndexQueryBaseKey(organizationId),
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
  const shouldRead = organizationId && propertyId && !propertyId.startsWith("UNT-");
  return useQuery(
    api.clients.read.listUnitLinksForProperty,
    shouldRead ? { organizationId, propertyId: propertyId as Id<"propertyUnits"> } : "skip",
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
    ...(typeof values.pipelineOrder === "number" ? { pipelineOrder: values.pipelineOrder } : {}),
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
