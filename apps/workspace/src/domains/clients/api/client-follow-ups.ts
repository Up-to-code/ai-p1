"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { ClientFollowUp, ClientFollowUpPayload } from "../store/client-follow-ups.types";
export type { ClientFollowUpPayload } from "../store/client-follow-ups.types";

export function useClientFollowUpsQuery(organizationId: string | undefined, clientId: string, options?: { status?: string; enabled?: boolean }) {
  return useQuery(
    api.clientFollowUps.read.listByClient,
    organizationId && clientId && options?.enabled !== false
      ? {
          organizationId,
          clientId,
          ...(options?.status ? { status: options.status as ClientFollowUp["status"] } : {}),
        }
      : "skip",
  );
}

export function useClientFollowUpStatsQuery(organizationId: string | undefined, clientId: string) {
  return useQuery(
    api.clientFollowUps.read.stats,
    organizationId && clientId ? { organizationId, clientId } : "skip",
  );
}

export async function createFollowUpRequest(organizationId: string, input: ClientFollowUpPayload) {
  return requestOrganizationAction<{ followUp: ClientFollowUp }>(
    organizationApiPath(organizationId, "client-follow-ups"),
    "POST",
    input,
    "Follow-up request failed.",
  );
}

export async function updateFollowUpRequest(organizationId: string, followUpId: string, input: ClientFollowUpPayload) {
  return requestOrganizationAction<{ followUp: ClientFollowUp }>(
    organizationApiPath(organizationId, "client-follow-ups", followUpId),
    "PATCH",
    input,
    "Follow-up request failed.",
  );
}

export async function deleteFollowUpRequest(organizationId: string, followUpId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "client-follow-ups", followUpId),
    "DELETE",
    undefined,
    "Follow-up request failed.",
  );
}

export async function markFollowUpCompleteRequest(organizationId: string, followUpId: string) {
  return requestOrganizationAction<{ followUp: ClientFollowUp }>(
    organizationApiPath(organizationId, "client-follow-ups", followUpId, "complete"),
    "PATCH",
    undefined,
    "Follow-up request failed.",
  );
}
