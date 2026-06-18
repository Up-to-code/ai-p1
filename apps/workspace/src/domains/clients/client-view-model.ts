import type { ClientTaskPayload } from "@/domains/clients/api/client-tasks";
import type { Client, ClientType } from "./store/clients.types";
import type { ClientFormValues } from "./validation/client.schema";

export type AssetStatus = "available" | "reserved" | "pending" | "sold" | "draft";

export const pipelineStages = ["new", "qualified", "review", "negotiation", "closed"] as const;
export const activePipelineStages = ["new", "qualified", "review", "negotiation"] as const;
export const clientFilters = ["all", "person", "organization"] as const;
export const clientViews = ["pipeline", "list", "calendar"] as const;
export const clientStageFilters = ["all", "active", "closed"] as const;
export const clientTypes = ["person", "organization"] as const;
export const clientStatuses = ["new", "active", "nurture", "inactive", "archived"] as const;
export const clientPriorities = ["normal", "high", "urgent"] as const;
export const clientAssetLinkStatuses = ["interested", "shortlisted", "review", "proposal", "rejected"] as const;

export type StatusPillTone = "danger" | "info" | "neutral" | "success" | "warning";
export type PipelineStage = (typeof pipelineStages)[number];

export function assetStatusTone(status: AssetStatus): StatusPillTone {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}


export function typeTone(type: ClientType): StatusPillTone {
  if (type === "organization") return "info";
  return "neutral";
}

export function clientToFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    type: client.type,
    contact: client.contact,
    phone: client.phone,
    age: String(client.age),
    nationality: client.nationality,
    generation: client.generation,
    budget: client.budget,
    assetInterest: client.assetInterest,
    status: client.status,
    visibility: client.visibility ?? "private",
    pipelineStage: client.pipelineStage,
    pipelineOrder: client.pipelineOrder,
    priority: client.priority,
    nextAction: client.nextAction,
    issue: client.issue ?? "",
    notes: client.notes ?? "",
  };
}

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function clientValuesFromFormData(formData: FormData): ClientFormValues {
  return {
    name: formText(formData, "name"),
    type: formText(formData, "type") as ClientFormValues["type"],
    contact: formText(formData, "contact"),
    phone: formText(formData, "phone"),
    age: formText(formData, "age"),
    nationality: formText(formData, "nationality"),
    generation: formText(formData, "generation"),
    budget: formText(formData, "budget"),
    assetInterest: formText(formData, "assetInterest"),
    status: formText(formData, "status") as ClientFormValues["status"],
    visibility: (formText(formData, "visibility") || "private") as ClientFormValues["visibility"],
    pipelineStage: normalizeClientPipelineStage(formText(formData, "pipelineStage")),
    priority: formText(formData, "priority") as ClientFormValues["priority"],
    nextAction: formText(formData, "nextAction"),
    issue: formText(formData, "issue"),
    notes: formText(formData, "notes"),
  };
}

export function normalizeClientPipelineStage(stage: string): PipelineStage {
  if (stage === "viewing") return "review";
  return pipelineStages.includes(stage as PipelineStage) ? stage as PipelineStage : "new";
}

export function normalizeClientAssetLinkStatus(status: string): (typeof clientAssetLinkStatuses)[number] {
  if (status === "viewing") return "review";
  if (status === "offer") return "proposal";
  return clientAssetLinkStatuses.includes(status as (typeof clientAssetLinkStatuses)[number])
    ? status as (typeof clientAssetLinkStatuses)[number]
    : "shortlisted";
}

function dateInputToTimestamp(value: string) {
  if (!value) return undefined;
  const timestamp = new Date(`${value}T12:00:00`).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function dateInputToDate(value: string) {
  if (!value) return undefined;
  const timestamp = dateInputToTimestamp(value);
  return timestamp ? new Date(timestamp).toISOString().slice(0, 10) : undefined;
}

export function taskPayloadFromFormData(formData: FormData, _clientId: string): ClientTaskPayload {
  void _clientId;
  return {
    title: formText(formData, "title"),
    status: formText(formData, "status") as ClientTaskPayload["status"],
    visibility: (formText(formData, "visibility") || "private") as ClientTaskPayload["visibility"],
    priority: formText(formData, "priority") as ClientTaskPayload["priority"],
    dueDate: dateInputToDate(formText(formData, "dueAt")),
    description: formText(formData, "notes") || undefined,
  };
}

type ClientTaskUpdateSource = {
  title: string;
  status?: ClientTaskPayload["status"];
  visibility?: ClientTaskPayload["visibility"];
  priority?: ClientTaskPayload["priority"];
  dueAt?: number;
  dueDate?: string;
  description?: string;
};

export function clientTaskUpdatePayload(
  task: ClientTaskUpdateSource,
  _clientId: string,
  patch: Partial<ClientTaskPayload> = {},
): ClientTaskPayload {
  return {
    title: task.title,
    status: task.status,
    visibility: task.visibility ?? "private",
    priority: task.priority,
    dueDate: task.dueDate,
    description: task.description,
    ...patch,
  };
}

export function clientTaskDueDateLabel(dueAt: number | undefined, locale: string, emptyLabel: string) {
  if (!dueAt) return emptyLabel;
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return emptyLabel;
  return date.toLocaleDateString(locale);
}

export function clientTaskStatusTone(status: string): StatusPillTone {
  if (status === "done") return "success";
  if (status === "canceled") return "neutral";
  return "warning";
}

export function clientTaskActivityRows<
  TTask extends { dueAt?: number; assetId?: string; status: string },
  TAsset extends { id: string },
>(tasks: TTask[], assets: TAsset[], locale: string, emptyDateLabel: string) {
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  return tasks.map((task) => ({
    task,
    linkedAsset: task.assetId ? assetById.get(task.assetId) : undefined,
    isDone: task.status === "done",
    statusTone: clientTaskStatusTone(task.status),
    dueDateLabel: clientTaskDueDateLabel(task.dueAt, locale, emptyDateLabel),
  }));
}

export function matchesClientSearch(
  client: { name: string; contact: string; assetInterest: string; budget: string },
  search: string,
) {
  const q = search.trim().toLowerCase();
  return !q || [client.name, client.contact, client.assetInterest, client.budget].some((value) => value.toLowerCase().includes(q));
}

export function isActivePipelineStage(stage: string): stage is (typeof activePipelineStages)[number] {
  return activePipelineStages.includes(normalizeClientPipelineStage(stage) as (typeof activePipelineStages)[number]);
}

export function clientPipelineStageIndex(stage: string) {
  return Math.max(0, pipelineStages.indexOf(normalizeClientPipelineStage(stage)));
}

export function activeJourneyClients<TClient extends { pipelineStage: string }>(clients: TClient[]) {
  return clients.filter((client) => isActivePipelineStage(client.pipelineStage));
}

export function clientsForStageFilter<TClient extends { pipelineStage: string }>(
  clients: TClient[],
  stageFilter: (typeof clientStageFilters)[number],
) {
  if (stageFilter === "active") return activeJourneyClients(clients);
  if (stageFilter === "closed") return clients.filter((client) => normalizeClientPipelineStage(client.pipelineStage) === "closed");
  return clients;
}

export function displayedClientsForView<TClient extends { pipelineStage: string }>(
  clients: TClient[],
  view: (typeof clientViews)[number],
  stageFilter: (typeof clientStageFilters)[number],
) {
  if (view === "pipeline") return activeJourneyClients(clients);
  if (view === "list") return clientsForStageFilter(clients, stageFilter);
  return clients;
}

export function calendarEventsForClients<TEvent extends { clientId?: string | null }, TClient extends { id: string }>(
  events: TEvent[],
  clients: TClient[],
) {
  const clientIds = new Set(clients.map((client) => client.id));
  return events.filter((event) => !event.clientId || clientIds.has(event.clientId));
}

export function availableClientAssets<TAsset extends { id: string }, TLink extends { link: { assetId: string } }>(
  assets: TAsset[],
  linkedAssets: TLink[],
) {
  const linkedAssetIds = new Set(linkedAssets.map(({ link }) => link.assetId));
  return assets.filter((asset) => !linkedAssetIds.has(asset.id));
}

export function matchesClientAssetSearch(
  asset: {
    title: string;
    project: string;
    price: string;
    area: string;
    status: string;
    reference: string;
  },
  search: string,
) {
  const q = search.trim().toLowerCase();
  return !q || [asset.title, asset.project, asset.price, asset.area, asset.status, asset.reference]
    .some((value) => String(value ?? "").toLowerCase().includes(q));
}

export function clientAssetPickerResults<TAsset extends {
  id: string;
  title: string;
  project: string;
  price: string;
  area: string;
  status: AssetStatus;
  reference: string;
  bedrooms: string | number;
  bathrooms: number;
}>(
  assets: TAsset[],
  linkedAssets: Array<{ link: { assetId: string } }>,
  statusFilter: "all" | AssetStatus,
  search: string,
  limit = 36,
) {
  return clientAssetPickerProjection(assets, linkedAssets, statusFilter, search, limit).visibleAvailableAssets;
}

export function clientAssetPickerProjection<TAsset extends {
  id: string;
  title: string;
  project: string;
  price: string;
  area: string;
  status: AssetStatus;
  reference: string;
  bedrooms: string | number;
  bathrooms: number;
}>(
  assets: TAsset[],
  linkedAssets: Array<{ link: { assetId: string } }>,
  statusFilter: "all" | AssetStatus,
  search: string,
  limit = 36,
) {
  const availableAssets = availableClientAssets(assets, linkedAssets);
  const filteredAvailableAssets = availableAssets
    .filter((asset) => statusFilter === "all" || asset.status === statusFilter)
    .filter((asset) => matchesClientAssetSearch(asset, search));

  return {
    availableAssets,
    filteredAvailableAssets,
    visibleAvailableAssets: filteredAvailableAssets.slice(0, limit),
  };
}
