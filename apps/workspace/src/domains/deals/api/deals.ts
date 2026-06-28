"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useWorkspaceResource } from "@/domains/resources/workspace-resource-request";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import { useToast } from "@/components/ui/toast";
import type { Deal, DealFormValues, DealStage, DealStats } from "../store/deals.types";

export function useDealsQuery(organizationId?: string, options?: { stage?: DealStage | "all"; search?: string }) {
  return useWorkspaceResource<Deal[]>(
    ["deals", organizationId, options?.stage, options?.search],
    organizationId,
    "deals",
    {
      stage: options?.stage === "all" ? undefined : options?.stage,
      search: options?.search,
    },
  );
}

export function useDealStatsQuery(organizationId?: string) {
  return useWorkspaceResource<DealStats>(
    ["deals-stats", organizationId],
    organizationId,
    "deals/stats",
  );
}

export function useDealQuery(organizationId: string | undefined, dealId: string) {
  return useWorkspaceResource<Deal | null>(
    ["deal", organizationId, dealId],
    organizationId && dealId ? organizationId : undefined,
    `deals/${dealId}`,
  );
}

function parseOptionalFormNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : undefined;
}

export function dealPayloadFromForm(values: DealFormValues) {
  return {
    title: values.title,
    stage: values.stage,
    status: values.status,
    priority: values.priority,
    value: parseOptionalFormNumber(values.value),
    currency: values.currency || "USD",
    dealThinking: values.dealThinking || undefined,
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    clientId: values.clientId || undefined,
    projectId: values.projectId || undefined,
    source: values.source || undefined,
    closeDate: values.closeDate || undefined,
    nextStep: values.nextStep || undefined,
  };
}

export async function createDealRequest(organizationId: string, values: DealFormValues) {
  return workspaceMutation<{ deal: Deal }>(organizationId, "deals", {
    method: "POST",
    body: dealPayloadFromForm(values),
    fallbackMessage: "Deal request failed.",
  });
}

export async function updateDealRequest(organizationId: string, dealId: string, values: DealFormValues) {
  return workspaceMutation<{ deal: Deal }>(organizationId, `deals/${dealId}`, {
    method: "PATCH",
    body: dealPayloadFromForm(values),
    fallbackMessage: "Deal request failed.",
  });
}

export async function deleteDealRequest(organizationId: string, dealId: string) {
  return workspaceMutation(organizationId, `deals/${dealId}`, {
    method: "DELETE",
    body: undefined,
    fallbackMessage: "Deal request failed.",
  });
}

function dealsQueryBaseKey(organizationId?: string) {
  return ["deals", organizationId] as const;
}

export function useUpdateDealOptimisticMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      dealId,
      values,
    }: {
      organizationId: string;
      dealId: string;
      values: Partial<DealFormValues>;
    }) => updateDealRequest(organizationId, dealId, values as DealFormValues),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<Deal[] | undefined>(
        queryKey,
        (data) => {
          if (!data) return data;
          return data.map((d) =>
            d.id === variables.dealId
              ? { ...d, ...variables.values, updatedAt: Date.now() } as Deal
              : d,
          );
        },
      );
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Deal update failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      toast({ title: "Deal saved.", type: "success" });
      void queryClient.invalidateQueries({ queryKey: dealsQueryBaseKey(variables.organizationId) });
    },
  });
}

export function useDeleteDealOptimisticMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ organizationId, dealId }: { organizationId: string; dealId: string }) =>
      deleteDealRequest(organizationId, dealId),
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<Deal[] | undefined>(
        queryKey,
        (data) => {
          if (!data) return data;
          return data.filter((d) => d.id !== variables.dealId);
        },
      );
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Deal delete failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      toast({ title: "Deal deleted.", type: "success" });
      void queryClient.invalidateQueries({ queryKey: dealsQueryBaseKey(variables.organizationId) });
    },
  });
}
