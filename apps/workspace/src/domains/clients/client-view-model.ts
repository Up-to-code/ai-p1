import type { ClientTaskPayload } from "@/domains/clients/api/client-tasks";
import type { PropertyStatus } from "@/domains/properties";
import type { Client, ClientType } from "./store/clients.types";
import type { ClientFormValues } from "./validation/client.schema";

export const pipelineStages = ["new", "qualified", "viewing", "negotiation", "closed"] as const;
export const activePipelineStages = ["new", "qualified", "viewing", "negotiation"] as const;
export const clientFilters = ["all", "Buyer", "Tenant", "Investor", "Broker"] as const;
export const clientViews = ["pipeline", "list", "calendar"] as const;
export const clientStageFilters = ["all", "active", "closed"] as const;
export const clientTypes = ["Buyer", "Tenant", "Investor", "Broker"] as const;
export const clientStatuses = ["active", "inactive"] as const;
export const clientPriorities = ["normal", "high", "urgent"] as const;
export const unitLinkStatuses = ["interested", "shortlisted", "viewing", "offer", "rejected"] as const;

export type StatusPillTone = "danger" | "info" | "neutral" | "success" | "warning";
export type PipelineStage = (typeof pipelineStages)[number];

export function unitStatusTone(status: PropertyStatus): StatusPillTone {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}

export function typeTone(type: ClientType): StatusPillTone {
  if (type === "Investor") return "success";
  if (type === "Broker") return "warning";
  if (type === "Tenant") return "info";
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
    propertyInterest: client.propertyInterest,
    status: client.status,
    visibility: client.visibility ?? "private",
    pipelineStage: client.pipelineStage,
    pipelineOrder: client.pipelineOrder,
    priority: client.priority,
    nextAction: client.nextAction,
    issue: client.issue ?? "",
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
    propertyInterest: formText(formData, "propertyInterest"),
    status: formText(formData, "status") as ClientFormValues["status"],
    visibility: (formText(formData, "visibility") || "private") as ClientFormValues["visibility"],
    pipelineStage: formText(formData, "pipelineStage") as ClientFormValues["pipelineStage"],
    priority: formText(formData, "priority") as ClientFormValues["priority"],
    nextAction: formText(formData, "nextAction"),
    issue: formText(formData, "issue"),
  };
}

function dateInputToTimestamp(value: string) {
  if (!value) return undefined;
  const timestamp = new Date(`${value}T12:00:00`).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

export function taskPayloadFromFormData(formData: FormData, clientId: string): ClientTaskPayload {
  return {
    clientId,
    title: formText(formData, "title"),
    status: formText(formData, "status") as ClientTaskPayload["status"],
    visibility: (formText(formData, "visibility") || "private") as ClientTaskPayload["visibility"],
    priority: formText(formData, "priority") as ClientTaskPayload["priority"],
    dueAt: dateInputToTimestamp(formText(formData, "dueAt")),
    propertyId: formText(formData, "propertyId") || undefined,
    notes: formText(formData, "notes") || undefined,
  };
}

type ClientTaskUpdateSource = {
  title: string;
  status?: ClientTaskPayload["status"];
  visibility?: ClientTaskPayload["visibility"];
  priority?: ClientTaskPayload["priority"];
  dueAt?: number;
  propertyId?: string;
  projectId?: string;
  calendarEventId?: string;
  notes?: string;
};

export function clientTaskUpdatePayload(
  task: ClientTaskUpdateSource,
  clientId: string,
  patch: Partial<ClientTaskPayload> = {},
): ClientTaskPayload {
  return {
    clientId,
    title: task.title,
    status: task.status,
    visibility: task.visibility ?? "private",
    priority: task.priority,
    dueAt: task.dueAt,
    propertyId: task.propertyId,
    projectId: task.projectId,
    calendarEventId: task.calendarEventId,
    notes: task.notes,
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
  TTask extends { dueAt?: number; propertyId?: string; status: string },
  TUnit extends { id: string },
>(tasks: TTask[], units: TUnit[], locale: string, emptyDateLabel: string) {
  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  return tasks.map((task) => ({
    task,
    linkedUnit: task.propertyId ? unitById.get(task.propertyId) : undefined,
    isDone: task.status === "done",
    statusTone: clientTaskStatusTone(task.status),
    dueDateLabel: clientTaskDueDateLabel(task.dueAt, locale, emptyDateLabel),
  }));
}

export function matchesClientSearch(
  client: { name: string; contact: string; propertyInterest: string; budget: string },
  search: string,
) {
  const q = search.trim().toLowerCase();
  return !q || [client.name, client.contact, client.propertyInterest, client.budget].some((value) => value.toLowerCase().includes(q));
}

export function isActivePipelineStage(stage: string): stage is (typeof activePipelineStages)[number] {
  return activePipelineStages.includes(stage as (typeof activePipelineStages)[number]);
}

export function clientPipelineStageIndex(stage: string) {
  return Math.max(0, pipelineStages.indexOf(stage as PipelineStage));
}

export function activeJourneyClients<TClient extends { pipelineStage: string }>(clients: TClient[]) {
  return clients.filter((client) => isActivePipelineStage(client.pipelineStage));
}

export function clientsForStageFilter<TClient extends { pipelineStage: string }>(
  clients: TClient[],
  stageFilter: (typeof clientStageFilters)[number],
) {
  if (stageFilter === "active") return activeJourneyClients(clients);
  if (stageFilter === "closed") return clients.filter((client) => client.pipelineStage === "closed");
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

export function availableClientUnits<TUnit extends { id: string }, TLink extends { link: { propertyId: string } }>(
  units: TUnit[],
  linkedUnits: TLink[],
) {
  const linkedUnitIds = new Set(linkedUnits.map(({ link }) => link.propertyId));
  return units.filter((unit) => !linkedUnitIds.has(unit.id));
}

export function matchesClientUnitSearch(
  unit: {
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
  return !q || [unit.title, unit.project, unit.price, unit.area, unit.status, unit.reference]
    .some((value) => String(value ?? "").toLowerCase().includes(q));
}

export function clientUnitPickerResults<TUnit extends {
  id: string;
  title: string;
  project: string;
  price: string;
  area: string;
  status: PropertyStatus;
  reference: string;
}>(
  units: TUnit[],
  linkedUnits: Array<{ link: { propertyId: string } }>,
  statusFilter: "all" | PropertyStatus,
  search: string,
  limit = 36,
) {
  return clientUnitPickerProjection(units, linkedUnits, statusFilter, search, limit).visibleAvailableUnits;
}

export function clientUnitPickerProjection<TUnit extends {
  id: string;
  title: string;
  project: string;
  price: string;
  area: string;
  status: PropertyStatus;
  reference: string;
}>(
  units: TUnit[],
  linkedUnits: Array<{ link: { propertyId: string } }>,
  statusFilter: "all" | PropertyStatus,
  search: string,
  limit = 36,
) {
  const availableUnits = availableClientUnits(units, linkedUnits);
  const filteredAvailableUnits = availableUnits
    .filter((unit) => statusFilter === "all" || unit.status === statusFilter)
    .filter((unit) => matchesClientUnitSearch(unit, search));

  return {
    availableUnits,
    filteredAvailableUnits,
    visibleAvailableUnits: filteredAvailableUnits.slice(0, limit),
  };
}
