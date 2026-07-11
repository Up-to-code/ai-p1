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
import { createResourceApi } from "@/domains/resources/resource-api-factory";
import type { Client, ClientType } from "../store/clients.types";
import type { ClientFormValues } from "../validation/client.schema";
import {
  addClientToIndexData,
  clientFormValuesForPipeline,
  patchClientInIndexData,
  provisionalClientFromFormValues,
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

export function useCreateClientOptimisticMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      values,
    }: {
      organizationId: string;
      values: ClientFormValues;
    }) => clientApi.create(organizationId, values),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined, optimisticId: undefined };

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ClientsIndexData>(queryKey);
      const optimisticClient = provisionalClientFromFormValues(variables.values);

      queryClient.setQueryData<ClientsIndexData>(
        queryKey,
        (data) => addClientToIndexData(data, optimisticClient),
      );

      return { previousData, optimisticId: optimisticClient.id };
    },
    onError: (_error, variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Client create failed. Reverted.", type: "error" });
      void queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(variables.organizationId) });
    },
    onSuccess: (result, variables, context) => {
      if (queryKey && context?.optimisticId) {
        queryClient.setQueryData<ClientsIndexData>(
          queryKey,
          (data) => patchClientInIndexData(data, context.optimisticId!, { ...result.client, id: result.client.id }),
        );
      } else if (queryKey) {
        queryClient.setQueryData<ClientsIndexData>(
          queryKey,
          (data) => addClientToIndexData(data, result.client, { bumpStats: true }),
        );
      }
      toast({ title: "Client created.", type: "success" });
      void queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(variables.organizationId) });
    },
  });
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
    }) => clientApi.update(organizationId, client.id, values),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ClientsIndexData>(queryKey);

      queryClient.setQueryData<ClientsIndexData>(
        queryKey,
        (data) => patchClientInIndexData(data, variables.client.id, {
          ...clientPayloadFromForm(variables.values),
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
      clientApi.remove(organizationId, clientId),
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
      return clientApi.update(organizationId, client.id, clientFormValuesForPipeline(client, stage, pipelineOrder));
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

export function clientPayloadFromForm(values: ClientFormValues) {
  const legacyTypeMap = {
    Buyer: "person",
    Tenant: "person",
    Investor: "person",
    Broker: "organization",
  } as const;
  const type = values.type in legacyTypeMap
    ? legacyTypeMap[values.type as keyof typeof legacyTypeMap]
    : values.type;
  const rawVisibility = values.visibility as string | undefined;
  const visibility = rawVisibility === "public" ? "workspace" : values.visibility;

  return {
    name: values.name,
    type,
    email: values.contact,
    phone: values.phone,
    contact: values.contact,
    company: values.company || undefined,
    contactName: values.contactName || undefined,
    website: values.website || undefined,
    source: values.source || "manual",
    priority: values.priority,
    budget: values.budget || undefined,
    assetInterest: values.assetInterest || undefined,
    lastContact: values.lastContact || undefined,
    status: values.status,
    visibility: visibility ?? "private",
    pipelineStage: values.pipelineStage,
    pipelineOrder: typeof values.pipelineOrder === "number" && Number.isFinite(values.pipelineOrder)
      ? values.pipelineOrder
      : undefined,
    notes: values.notes || [values.nextAction, values.issue].filter(Boolean).join("\n") || undefined,
    tags: values.tags,
  };
}

export const clientApi = createResourceApi<Client, ClientFormValues, ClientFormValues>({
  resourcePath: "clients",
  resourceKey: "client",
  toPayload: clientPayloadFromForm,
});

export const createClientRequest = clientApi.create;
export const updateClientRequest = clientApi.update;
export const deleteClientRequest = clientApi.remove;
