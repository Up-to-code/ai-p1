import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { assertActiveWorkspaceRecord } from "../workspace/businessData";

export type Input = Record<string, unknown>;

const DEFAULT_TOOL_LIST_LIMIT = 25;
const MAX_TOOL_LIST_LIMIT = 50;

export function inputObject(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Input)
    : {};
}

export function requiredString(input: Input, key: string) {
  const value = input[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }
  return value;
}

export function optionalString(input: Input, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function optionalNumber(input: Input, key: string) {
  const value = input[key];
  return typeof value === "number" ? value : undefined;
}

export function listLimit(input: Input) {
  const value = optionalNumber(input, "limit");
  if (value === undefined) return DEFAULT_TOOL_LIST_LIMIT;
  if (!Number.isInteger(value) || value < 1 || value > MAX_TOOL_LIST_LIMIT) {
    throw new Error(`limit must be an integer from 1 to ${MAX_TOOL_LIST_LIMIT}.`);
  }
  return value;
}

export function listCursor(input: Input) {
  const value = input.cursor;
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new Error("cursor must be a string or null.");
  return value;
}

export function searchTerm(input: Input) {
  const value = optionalString(input, "search");
  return value?.trim().toLowerCase();
}

export function matchesSearch(search: string | undefined, values: string[]) {
  if (!search) return true;
  return values.some((value) => value.toLowerCase().includes(search));
}

export function requiredNumber(input: Input, key: string) {
  const value = input[key];
  if (typeof value !== "number") throw new Error(`${key} is required.`);
  return value;
}

export function pagedResult<T>(
  page: { page: T[]; isDone: boolean; continueCursor: string },
  mapItem: (item: T) => unknown,
) {
  return {
    items: page.page.map(mapItem),
    isDone: page.isDone,
    continueCursor: page.continueCursor,
  };
}

export function cappedSearchResult<T>(items: T[], mapItem: (item: T) => unknown) {
  return {
    items: items.map(mapItem),
    isDone: true,
    continueCursor: "",
  };
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

export function clientInput(input: Input) {
  return {
    name: requiredString(input, "name"),
    type: oneOf(input.type, ["Buyer", "Tenant", "Investor", "Broker"] as const, "Buyer"),
    contact: requiredString(input, "contact"),
    phone: requiredString(input, "phone"),
    age: optionalNumber(input, "age") ?? 0,
    nationality: optionalString(input, "nationality") ?? "",
    generation: optionalString(input, "generation") ?? "",
    budget: optionalString(input, "budget") ?? "",
    propertyInterest: optionalString(input, "propertyInterest") ?? "",
    status: oneOf(input.status, ["active", "inactive"] as const, "active"),
    pipelineStage: oneOf(input.pipelineStage, ["new", "qualified", "viewing", "negotiation", "closed"] as const, "new"),
    ...(optionalNumber(input, "pipelineOrder") !== undefined ? { pipelineOrder: optionalNumber(input, "pipelineOrder")! } : {}),
    priority: priority(input),
    nextAction: optionalString(input, "nextAction") ?? "Follow up",
    issue: optionalString(input, "issue"),
  };
}

export function propertyInput(input: Input) {
  return {
    title: requiredString(input, "title"),
    projectId: optionalString(input, "projectId") as Id<"projects"> | undefined,
    project: optionalString(input, "project") ?? "",
    city: requiredString(input, "city"),
    type: requiredString(input, "type"),
    status: oneOf(input.status, ["available", "sold", "reserved", "pending", "draft"] as const, "draft"),
    purpose: oneOf(input.purpose, ["sale", "rent"] as const, "sale"),
    price: requiredString(input, "price"),
    area: requiredString(input, "area"),
    bedrooms: optionalNumber(input, "bedrooms") ?? 0,
    bathrooms: optionalNumber(input, "bathrooms") ?? 0,
    description: optionalString(input, "description") ?? "",
  };
}

export function propertyFieldPatch(input: Input) {
  const field = requiredString(input, "field");
  const allowed = new Set(["title", "project", "city", "type", "status", "purpose", "price", "area", "bedrooms", "bathrooms", "description"]);
  if (!allowed.has(field)) throw new Error("This apartment field cannot be edited by MCP.");
  return { [field]: input.value };
}

export function projectStatus(input: Input) {
  return oneOf(input.status, ["draft", "pending", "approved", "rejected"] as const, "draft");
}

export function projectInput(input: Input) {
  const projectPrices = Array.isArray(input.projectPrices)
    ? input.projectPrices
        .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
        .map((item, index) => ({
          id: optionalString(item, "id") ?? `price-${index + 1}`,
          label: optionalString(item, "label") ?? "",
          price: optionalString(item, "price") ?? "",
        }))
    : undefined;
  const averagePrice = optionalString(input, "averagePrice") ?? optionalString(input, "priceRange") ?? "";
  const projectPriceDisplay = projectPrices?.map((item) => item.price).filter(Boolean).join(" - ");
  const priceRange = projectPriceDisplay || averagePrice;

  return {
    name: requiredString(input, "name"),
    developer: requiredString(input, "developer"),
    city: requiredString(input, "city"),
    area: requiredString(input, "area"),
    type: requiredString(input, "type"),
    unitTypes: Array.isArray(input.unitTypes) ? input.unitTypes.filter((value) => typeof value === "string") : undefined,
    status: projectStatus(input),
    units: optionalNumber(input, "units") ?? 0,
    averagePrice,
    projectPrices,
    priceRange,
    regaAuthorizationNo: optionalString(input, "regaAuthorizationNo"),
    regaExpiresAt: optionalString(input, "regaExpiresAt"),
    planNumber: optionalString(input, "planNumber"),
    plotNumber: optionalString(input, "plotNumber"),
    postalIdentity: optionalString(input, "postalIdentity"),
    description: optionalString(input, "description") ?? "",
  };
}

export function calendarInput(input: Input) {
  return {
    title: requiredString(input, "title"),
    owner: optionalString(input, "owner") ?? "Agent",
    startAt: requiredNumber(input, "startAt"),
    endAt: optionalNumber(input, "endAt"),
    type: oneOf(input.type, ["visit", "call", "meeting", "client-visit", "site-viewing", "appointment", "signing", "follow-up", "handover", "audit", "custom"] as const, "meeting"),
    status: oneOf(input.status, ["confirmed", "pending", "draft"] as const, "confirmed"),
    clientId: optionalString(input, "clientId") as Id<"clients"> | undefined,
    propertyId: optionalString(input, "propertyId") as Id<"propertyUnits"> | undefined,
    projectId: optionalString(input, "projectId") as Id<"projects"> | undefined,
    taskId: optionalString(input, "taskId") as Id<"clientTasks"> | undefined,
    location: optionalString(input, "location"),
    notes: optionalString(input, "notes"),
    customFields: Array.isArray(input.customFields)
      ? input.customFields
          .filter((field): field is { label: unknown; value: unknown } => Boolean(field) && typeof field === "object")
          .map((field) => ({ label: String(field.label ?? "").trim(), value: String(field.value ?? "").trim() }))
          .filter((field) => field.label || field.value)
      : undefined,
  };
}

function priority(input: Input) {
  return oneOf(input.priority, ["normal", "high", "urgent"] as const, "normal");
}

export function taskStatus(input: Input) {
  return oneOf(input.status, ["open", "done", "canceled"] as const, "open");
}

export function taskInput(input: Input) {
  return {
    clientId: requiredString(input, "clientId") as Id<"clients">,
    title: requiredString(input, "title"),
    status: taskStatus(input),
    priority: priority(input),
    dueAt: optionalNumber(input, "dueAt"),
    propertyId: optionalString(input, "propertyId") as Id<"propertyUnits"> | undefined,
    projectId: optionalString(input, "projectId") as Id<"projects"> | undefined,
    calendarEventId: optionalString(input, "calendarEventId") as Id<"calendarEvents"> | undefined,
    notes: optionalString(input, "notes"),
  };
}

export function clientUnitStatus(input: Input) {
  return oneOf(input.status, ["interested", "shortlisted", "viewing", "offer", "rejected"] as const, "interested");
}

export function mediaKind(input: Input) {
  return oneOf(input.kind, ["image", "video", "document"] as const, "document");
}

export async function assertMediaResource(
  ctx: MutationCtx,
  organizationId: string,
  input: Input,
) {
  const resourceType = requiredString(input, "resourceType");
  const resourceId = requiredString(input, "resourceId");
  if (resourceType === "project") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"projects">), organizationId, "Project");
  if (resourceType === "property") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"propertyUnits">), organizationId, "Property unit");
  if (resourceType === "client") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"clients">), organizationId, "Client");
  if (resourceType === "calendarEvent") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"calendarEvents">), organizationId, "Calendar event");
  if (resourceType === "task") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"clientTasks">), organizationId, "Task");
  throw new Error("Unsupported media resource type.");
}

export async function assertOptionalProject(ctx: MutationCtx, organizationId: string, projectId?: string) {
  if (!projectId) return;
  assertActiveWorkspaceRecord(await ctx.db.get(projectId as Id<"projects">), organizationId, "Project");
}

export async function assertCalendarLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: ReturnType<typeof calendarInput>,
) {
  if (input.clientId) assertActiveWorkspaceRecord(await ctx.db.get(input.clientId), organizationId, "Client");
  if (input.propertyId) assertActiveWorkspaceRecord(await ctx.db.get(input.propertyId), organizationId, "Property unit");
  if (input.projectId) assertActiveWorkspaceRecord(await ctx.db.get(input.projectId), organizationId, "Project");
  if (input.taskId) assertActiveWorkspaceRecord(await ctx.db.get(input.taskId), organizationId, "Task");
}

export async function assertTaskLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: ReturnType<typeof taskInput> | { status: "done"; completedAt: number },
) {
  if (!("clientId" in input)) return;
  assertActiveWorkspaceRecord(await ctx.db.get(input.clientId), organizationId, "Client");
  if (input.propertyId) assertActiveWorkspaceRecord(await ctx.db.get(input.propertyId), organizationId, "Property unit");
  if (input.projectId) assertActiveWorkspaceRecord(await ctx.db.get(input.projectId), organizationId, "Project");
  if (input.calendarEventId) assertActiveWorkspaceRecord(await ctx.db.get(input.calendarEventId), organizationId, "Calendar event");
}
