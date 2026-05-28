"use client";

import type { InfiniteData } from "@tanstack/react-query";
import type { IndexedInfinitePage } from "@/domains/resources/workspace-resource-request";
import type { Client } from "./store/clients.types";
import type { ClientFormValues } from "./validation/client.schema";

export type ClientStats = {
  total: number;
  active: number;
  inactive: number;
  buyers: number;
  tenants: number;
  investors: number;
  brokers: number;
  stages: Record<"new" | "qualified" | "viewing" | "negotiation" | "closed", number>;
};

export type ClientsIndexData = InfiniteData<IndexedInfinitePage<Client, ClientStats>, string | null>;
export type ClientPipelineStage = Client["pipelineStage"];
export type ActiveClientPipelineStage = Exclude<ClientPipelineStage, "closed">;

export function clientFormValuesForPipeline(
  client: Client,
  stage: ClientPipelineStage,
  pipelineOrder?: number,
): ClientFormValues {
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

export function patchClientInIndexData(data: ClientsIndexData | undefined, clientId: string, patch: Partial<Client>) {
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

export function removeClientFromIndexData(data: ClientsIndexData | undefined, clientId: string) {
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
