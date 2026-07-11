import type { InfiniteData } from "@tanstack/react-query";
import type { IndexedInfinitePage } from "@/domains/resources/workspace-resource-request";
import type { Client } from "./store/clients.types";
import type { ClientFormValues } from "./validation/client.schema";

export type ClientStats = {
  total: number;
  new?: number;
  active: number;
  nurture?: number;
  inactive: number;
  archived?: number;
  people?: number;
  organizations?: number;
  stages?: Record<"new" | "qualified" | "review" | "negotiation" | "closed", number>;
};

export type ClientsIndexData = InfiniteData<IndexedInfinitePage<Client, ClientStats>, string | null>;
export type ClientPipelineStage = NonNullable<Client["pipelineStage"]>;
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
    phone: client.phone ?? "",
    age: "",
    nationality: "",
    generation: "",
    budget: client.budget,
    assetInterest: client.assetInterest,
    status: client.status,
    visibility: client.visibility ?? "private",
    pipelineStage: stage as ClientFormValues["pipelineStage"],
    pipelineOrder,
    priority: client.priority,
    nextAction: "",
    issue: "",
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
    pages: data.pages.map((page, index) => ({
      ...page,
      list: {
        ...page.list,
        page: page.list.page.filter((client) => client.id !== clientId),
      },
      stats: index === 0 ? decrementClientStats(page.stats, page.list.page.find((client) => client.id === clientId)) : page.stats,
    })),
  } satisfies ClientsIndexData;
}

function incrementClientStats(stats: ClientStats | undefined, client: Client): ClientStats {
  const base: ClientStats = stats ?? { total: 0, active: 0, inactive: 0 };
  const stage = (client.pipelineStage ?? "new") as keyof NonNullable<ClientStats["stages"]>;
  const next: ClientStats = {
    ...base,
    total: base.total + 1,
    new: (base.new ?? 0) + (client.status === "new" ? 1 : 0),
    active: base.active + (client.status === "active" ? 1 : 0),
    nurture: (base.nurture ?? 0) + (client.status === "nurture" ? 1 : 0),
    inactive: base.inactive + (client.status === "inactive" ? 1 : 0),
    archived: (base.archived ?? 0) + (client.status === "archived" ? 1 : 0),
    people: (base.people ?? 0) + (client.type === "person" ? 1 : 0),
    organizations: (base.organizations ?? 0) + (client.type === "organization" ? 1 : 0),
    stages: base.stages
      ? { ...base.stages, [stage]: (base.stages[stage] ?? 0) + 1 }
      : undefined,
  };
  return next;
}

function decrementClientStats(stats: ClientStats | undefined, client: Client | undefined): ClientStats | undefined {
  if (!stats || !client) return stats;

  const stage = (client.pipelineStage ?? "new") as keyof NonNullable<ClientStats["stages"]>;

  return {
    ...stats,
    total: Math.max(0, stats.total - 1),
    new: Math.max(0, (stats.new ?? 0) - (client.status === "new" ? 1 : 0)),
    active: Math.max(0, stats.active - (client.status === "active" ? 1 : 0)),
    nurture: Math.max(0, (stats.nurture ?? 0) - (client.status === "nurture" ? 1 : 0)),
    inactive: Math.max(0, stats.inactive - (client.status === "inactive" ? 1 : 0)),
    archived: Math.max(0, (stats.archived ?? 0) - (client.status === "archived" ? 1 : 0)),
    people: Math.max(0, (stats.people ?? 0) - (client.type === "person" ? 1 : 0)),
    organizations: Math.max(0, (stats.organizations ?? 0) - (client.type === "organization" ? 1 : 0)),
    stages: stats.stages
      ? { ...stats.stages, [stage]: Math.max(0, (stats.stages[stage] ?? 0) - 1) }
      : undefined,
  };
}

export function provisionalClientFromFormValues(values: ClientFormValues): Client {
  const now = Date.now();
  return {
    _id: `optimistic-${now}`,
    _creationTime: now,
    id: `optimistic-${now}`,
    organizationId: "",
    name: values.name,
    type: values.type,
    ownerUserId: "",
    status: values.status,
    source: values.source || "manual",
    visibility: values.visibility ?? "private",
    contact: values.contact,
    phone: values.phone,
    company: values.company,
    contactName: values.contactName,
    website: values.website,
    budget: values.budget,
    assetInterest: values.assetInterest,
    added: new Date(now).toISOString().slice(0, 10),
    pipelineStage: values.pipelineStage ?? "new",
    pipelineOrder: values.pipelineOrder,
    priority: values.priority,
    lastContact: values.lastContact || new Date(now).toISOString().slice(0, 10),
    notes: values.notes || [values.nextAction, values.issue].filter(Boolean).join("\n") || undefined,
    tags: values.tags,
    createdByUserId: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function addClientToIndexData(
  data: ClientsIndexData | undefined,
  client: Client,
  options?: { bumpStats?: boolean },
) {
  const bumpStats = options?.bumpStats ?? true;

  if (!data || data.pages.length === 0) {
    return {
      pages: [{
        list: { page: [client], isDone: true, continueCursor: "" },
        stats: bumpStats ? incrementClientStats(undefined, client) : undefined,
      }],
      pageParams: [null],
    } satisfies ClientsIndexData;
  }

  const firstPage = data.pages[0];
  const alreadyListed = firstPage.list.page.some((row) => row.id === client.id);
  const page = alreadyListed
    ? firstPage.list.page.map((row) => (row.id === client.id ? { ...row, ...client } : row))
    : [client, ...firstPage.list.page];

  return {
    ...data,
    pages: data.pages.map((entry, index) => {
      if (index !== 0) return entry;
      return {
        ...entry,
        list: { ...entry.list, page },
        stats: bumpStats && !alreadyListed ? incrementClientStats(entry.stats, client) : entry.stats,
      };
    }),
  } satisfies ClientsIndexData;
}
