"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useToast } from "@/components/ui/toast";
import {
  useWorkspaceIndexedResource,
  useWorkspacePagedResource,
  useWorkspaceResource,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import type { Client, ClientType } from "../store/clients.types";
import type { ClientFormValues } from "../validation/client.schema";
import {
  clientFormValuesForPipeline,
  patchClientInIndexData,
  removeClientFromIndexData,
  type ActiveClientPipelineStage,
  type ClientStats,
  type ClientsIndexData,
} from "../pipeline-command";
import { nextPipelineOrder, type PipelineOrderClient } from "../pipeline-order";

export const CLIENTS_PAGE_SIZE = 50;

export function clientsIndexQueryBaseKey(organizationId?: string) {
  return ["clients-index", organizationId] as const;
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
      stage: ActiveClientPipelineStage;
      stageClients: PipelineOrderClient[];
      targetIndex: number;
    }) => {
      const pipelineOrder = nextPipelineOrder(stageClients, client.id, targetIndex);
      return updateClientRequest(organizationId, client.id, clientFormValuesForPipeline(client, stage, pipelineOrder));
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
  return useWorkspacePagedResource<Client>(
    ["clients-paged", organizationId],
    organizationId,
    "clients",
    { type: options?.type, search: options?.search },
    CLIENTS_PAGE_SIZE,
  );
}

export function useClientsIndexQuery(organizationId?: string, options?: { type?: ClientType; search?: string }) {
  return useWorkspaceIndexedResource<Client, ClientStats>(
    clientsIndexQueryBaseKey(organizationId),
    organizationId,
    "clients/index",
    "clients",
    { type: options?.type, search: options?.search },
    CLIENTS_PAGE_SIZE,
  );
}

export function useClientStatsQuery(organizationId?: string) {
  return useWorkspaceResource<ClientStats>(
    ["clients-stats", organizationId],
    organizationId,
    "clients/stats",
  );
}

export function useClientOptionsQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useWorkspaceResource<{ id: string; name: string }[]>(
    ["clients-options", organizationId],
    organizationId && options.enabled !== false ? organizationId : undefined,
    "clients/options",
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

export async function createClientRequest(organizationId: string, values: ClientFormValues) {
  return workspaceMutation<{ client: { id: string } }>(organizationId, "clients", {
    method: "POST",
    body: clientPayloadFromForm(values),
    fallbackMessage: "Client request failed.",
  });
}

export async function updateClientRequest(organizationId: string, clientId: string, values: ClientFormValues) {
  return workspaceMutation<{ client: { id: string } }>(organizationId, `clients/${clientId}`, {
    method: "PATCH",
    body: clientPayloadFromForm(values),
    fallbackMessage: "Client request failed.",
  });
}

export async function deleteClientRequest(organizationId: string, clientId: string) {
  return workspaceMutation(organizationId, `clients/${clientId}`, {
    method: "DELETE",
    fallbackMessage: "Client request failed.",
  });
}

export async function linkClientUnitRequest(organizationId: string, clientId: string, propertyId: string, status = "interested", notes?: string) {
  return workspaceMutation(organizationId, `clients/${clientId}/units`, {
    method: "POST",
    body: { propertyId, status, notes: notes?.trim() || undefined },
    fallbackMessage: "Client request failed.",
  });
}

export async function unlinkClientUnitRequest(organizationId: string, clientId: string, propertyId: string) {
  return workspaceMutation(organizationId, `clients/${clientId}/units/${propertyId}`, {
    method: "DELETE",
    fallbackMessage: "Client request failed.",
  });
}
