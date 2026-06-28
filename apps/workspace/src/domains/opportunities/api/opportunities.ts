"use client";

import { useWorkspaceResource } from "@/domains/resources/workspace-resource-request";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { Opportunity, OpportunityFormValues, OpportunityStage, OpportunityStats } from "../opportunities.types";

export function useOpportunitiesQuery(organizationId?: string, options?: { stage?: OpportunityStage | "all"; search?: string; projectId?: string | null }) {
  return useWorkspaceResource<Opportunity[]>(
    ["opportunities", organizationId, options?.stage, options?.search, options?.projectId],
    organizationId,
    "opportunities",
    {
      stage: options?.stage === "all" ? undefined : options?.stage,
      search: options?.search,
      projectId: options?.projectId ?? undefined,
    },
  );
}

export function useOpportunityStatsQuery(organizationId?: string) {
  return useWorkspaceResource<OpportunityStats>(
    ["opportunities-stats", organizationId],
    organizationId,
    "opportunities/stats",
  );
}

export function useOpportunityQuery(organizationId: string | undefined, opportunityId: string) {
  return useWorkspaceResource<Opportunity | null>(
    ["opportunity", organizationId, opportunityId],
    organizationId && opportunityId ? organizationId : undefined,
    `opportunities/${opportunityId}`,
  );
}

function parseOptionalFormNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : undefined;
}

export function opportunityPayloadFromForm(values: OpportunityFormValues) {
  return {
    title: values.title,
    stage: values.stage,
    status: values.status,
    priority: values.priority,
    value: parseOptionalFormNumber(values.value),
    currency: values.currency || "USD",
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    clientId: values.clientId || undefined,
    projectId: values.projectId || undefined,
    source: values.source || undefined,
    closeDate: values.closeDate || undefined,
    nextStep: values.nextStep || undefined,
  };
}

export async function createOpportunityRequest(organizationId: string, values: OpportunityFormValues) {
  return requestOrganizationAction<{ opportunity: Opportunity }>(
    organizationApiPath(organizationId, "opportunities"),
    "POST",
    opportunityPayloadFromForm(values),
    "Opportunity request failed.",
  );
}

export async function updateOpportunityRequest(organizationId: string, opportunityId: string, values: OpportunityFormValues) {
  return requestOrganizationAction<{ opportunity: Opportunity }>(
    organizationApiPath(organizationId, "opportunities", opportunityId),
    "PATCH",
    opportunityPayloadFromForm(values),
    "Opportunity request failed.",
  );
}

export async function deleteOpportunityRequest(organizationId: string, opportunityId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "opportunities", opportunityId),
    "DELETE",
    undefined,
    "Opportunity request failed.",
  );
}
