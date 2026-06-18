"use client";

import { useWorkspaceResource } from "@/domains/resources/workspace-resource-request";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
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
  return requestOrganizationAction<{ deal: Deal }>(
    organizationApiPath(organizationId, "deals"),
    "POST",
    dealPayloadFromForm(values),
    "Deal request failed.",
  );
}

export async function updateDealRequest(organizationId: string, dealId: string, values: DealFormValues) {
  return requestOrganizationAction<{ deal: Deal }>(
    organizationApiPath(organizationId, "deals", dealId),
    "PATCH",
    dealPayloadFromForm(values),
    "Deal request failed.",
  );
}

export async function deleteDealRequest(organizationId: string, dealId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "deals", dealId),
    "DELETE",
    undefined,
    "Deal request failed.",
  );
}
