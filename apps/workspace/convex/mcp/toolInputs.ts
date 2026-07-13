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

export function optionalRelationId(input: Input, key: string) {
  if (input[key] === null) return undefined;
  return optionalString(input, key);
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

export function matchesSearch(search: string | undefined, values: Array<string | undefined>) {
  if (!search) return true;
  return values.some((value) => value?.toLowerCase().includes(search));
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
    type: oneOf(input.type, ["person", "organization"] as const, "person"),
    status: oneOf(input.status, ["new", "active", "nurture", "inactive", "archived"] as const, "new"),
    source: optionalString(input, "source") ?? "mcp",
    company: optionalString(input, "company"),
    contactName: optionalString(input, "contactName"),
    email: optionalString(input, "email") ?? optionalString(input, "contact"),
    phone: optionalString(input, "phone"),
    website: optionalString(input, "website"),
    notes: optionalString(input, "notes"),
  };
}

/** Preserve omission semantics for Client updates after manifest validation. */
export function clientPatchInput(input: Input) {
  return {
    ...(Object.hasOwn(input, "name") ? { name: requiredString(input, "name") } : {}),
    ...(Object.hasOwn(input, "type")
      ? { type: oneOf(input.type, ["person", "organization"] as const, "person") }
      : {}),
    ...(Object.hasOwn(input, "status")
      ? { status: oneOf(input.status, ["new", "active", "nurture", "inactive", "archived"] as const, "new") }
      : {}),
    ...(Object.hasOwn(input, "source") ? { source: optionalString(input, "source") } : {}),
    ...(Object.hasOwn(input, "company") ? { company: optionalString(input, "company") } : {}),
    ...(Object.hasOwn(input, "contactName") ? { contactName: optionalString(input, "contactName") } : {}),
    ...(Object.hasOwn(input, "email") || Object.hasOwn(input, "contact")
      ? { email: optionalString(input, "email") ?? optionalString(input, "contact") ?? "" }
      : {}),
    ...(Object.hasOwn(input, "phone") ? { phone: optionalString(input, "phone") ?? "" } : {}),
    ...(Object.hasOwn(input, "website") ? { website: optionalString(input, "website") } : {}),
    ...(Object.hasOwn(input, "notes") ? { notes: optionalString(input, "notes") } : {}),
  };
}

export function projectStatus(input: Input) {
  return oneOf(input.status, ["planned", "active", "paused", "completed", "archived"] as const, "planned");
}

export function projectInput(input: Input) {
  return {
    name: requiredString(input, "name"),
    clientId: optionalRelationId(input, "clientId") as Id<"clients"> | undefined,
    opportunityId: optionalRelationId(input, "opportunityId") as Id<"opportunities"> | undefined,
    status: projectStatus(input),
    health: oneOf(input.health, ["onTrack", "atRisk", "blocked"] as const, "onTrack"),
    budget: optionalNumber(input, "budget"),
    currency: optionalString(input, "currency"),
    description: optionalString(input, "description"),
  };
}

function dealStage(input: Input) {
  return oneOf(input.stage, ["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"] as const, "lead");
}

function dealStatus(input: Input) {
  return oneOf(input.status, ["open", "won", "lost", "paused"] as const, "open");
}

export function dealInput(input: Input) {
  return {
    title: requiredString(input, "title"),
    clientId: optionalRelationId(input, "clientId") as Id<"clients"> | undefined,
    projectId: optionalRelationId(input, "projectId") as Id<"projects"> | undefined,
    stage: dealStage(input),
    status: dealStatus(input),
    value: optionalNumber(input, "value"),
    currency: optionalString(input, "currency") ?? "USD",
    dealThinking: optionalString(input, "dealThinking"),
    source: optionalString(input, "source") ?? "mcp",
    priority: priority(input),
    closeDate: optionalString(input, "closeDate"),
    nextStep: optionalString(input, "nextStep"),
    ownerUserId: optionalString(input, "ownerUserId"),
    tags: Array.isArray(input.tags) ? input.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim()) : undefined,
  };
}

export function calendarInput(input: Input) {
  return {
    title: requiredString(input, "title"),
    ownerUserId: optionalString(input, "ownerUserId"),
    clientId: optionalRelationId(input, "clientId") as Id<"clients"> | undefined,
    projectId: optionalRelationId(input, "projectId") as Id<"projects"> | undefined,
    taskId: optionalString(input, "taskId") as Id<"tasks"> | undefined,
    documentId: optionalString(input, "documentId") as Id<"docs"> | undefined,
    startAt: requiredNumber(input, "startAt"),
    endAt: optionalNumber(input, "endAt") ?? requiredNumber(input, "startAt"),
    type: oneOf(input.type, ["meeting", "deadline", "document", "reminder", "milestone", "focusBlock"] as const, "meeting"),
    status: oneOf(input.status, ["confirmed", "pending", "draft"] as const, "confirmed"),
    location: optionalString(input, "location"),
    meetingUrl: optionalString(input, "meetingUrl"),
    notes: optionalString(input, "notes"),
  };
}

export function calendarPatchInput(input: Input) {
  return {
    ...(Object.hasOwn(input, "title") ? { title: requiredString(input, "title") } : {}),
    ...(Object.hasOwn(input, "ownerUserId") ? { ownerUserId: optionalRelationId(input, "ownerUserId") } : {}),
    ...(Object.hasOwn(input, "clientId") ? { clientId: optionalRelationId(input, "clientId") } : {}),
    ...(Object.hasOwn(input, "projectId") ? { projectId: optionalRelationId(input, "projectId") } : {}),
    ...(Object.hasOwn(input, "taskId") ? { taskId: optionalRelationId(input, "taskId") } : {}),
    ...(Object.hasOwn(input, "documentId") ? { documentId: optionalRelationId(input, "documentId") } : {}),
    ...(Object.hasOwn(input, "startAt") ? { startAt: requiredNumber(input, "startAt") } : {}),
    ...(Object.hasOwn(input, "endAt") ? { endAt: requiredNumber(input, "endAt") } : {}),
    ...(Object.hasOwn(input, "type")
      ? { type: oneOf(input.type, ["meeting", "deadline", "document", "reminder", "milestone", "focusBlock"] as const, "meeting") }
      : {}),
    ...(Object.hasOwn(input, "status")
      ? { status: oneOf(input.status, ["confirmed", "pending", "draft"] as const, "confirmed") }
      : {}),
    ...(Object.hasOwn(input, "attendeeUserIds")
      ? { attendeeUserIds: Array.isArray(input.attendeeUserIds) ? input.attendeeUserIds.filter((id): id is string => typeof id === "string") : [] }
      : {}),
    ...(Object.hasOwn(input, "externalAttendees")
      ? { externalAttendees: Array.isArray(input.externalAttendees) ? input.externalAttendees.filter((id): id is string => typeof id === "string") : [] }
      : {}),
    ...(Object.hasOwn(input, "location") ? { location: optionalString(input, "location") } : {}),
    ...(Object.hasOwn(input, "meetingUrl") ? { meetingUrl: optionalString(input, "meetingUrl") } : {}),
    ...(Object.hasOwn(input, "notes") ? { notes: optionalString(input, "notes") } : {}),
    ...(Object.hasOwn(input, "tags")
      ? { tags: Array.isArray(input.tags) ? input.tags.filter((tag): tag is string => typeof tag === "string") : [] }
      : {}),
  };
}

function priority(input: Input) {
  return oneOf(input.priority, ["low", "normal", "high", "urgent"] as const, "normal");
}

export function taskStatus(input: Input) {
  return oneOf(input.status, ["todo", "inProgress", "waiting", "done", "canceled"] as const, "todo");
}

export function taskInput(input: Input) {
  return {
    title: requiredString(input, "title"),
    status: taskStatus(input),
    priority: priority(input),
    assigneeUserId: optionalString(input, "assigneeUserId"),
    clientId: optionalString(input, "clientId") as Id<"clients"> | undefined,
    projectId: optionalString(input, "projectId") as Id<"projects"> | undefined,
    spaceId: optionalString(input, "spaceId"),
    dueDate: optionalString(input, "dueDate"),
    description: optionalString(input, "description") ?? optionalString(input, "notes"),
    visibility: oneOf(input.visibility, ["private", "team", "workspace"] as const, "workspace"),
  };
}

export function taskPatchInput(input: Input) {
  return {
    ...(Object.hasOwn(input, "title") ? { title: requiredString(input, "title") } : {}),
    ...(Object.hasOwn(input, "status") ? { status: requiredString(input, "status") } : {}),
    ...(Object.hasOwn(input, "priority") ? { priority: priority(input) } : {}),
    ...(Object.hasOwn(input, "assigneeUserId") ? { assigneeUserId: optionalRelationId(input, "assigneeUserId") } : {}),
    ...(Object.hasOwn(input, "clientId") ? { clientId: optionalRelationId(input, "clientId") } : {}),
    ...(Object.hasOwn(input, "projectId") ? { projectId: optionalRelationId(input, "projectId") } : {}),
    ...(Object.hasOwn(input, "spaceId") ? { spaceId: optionalRelationId(input, "spaceId") } : {}),
    ...(Object.hasOwn(input, "startDate") ? { startDate: optionalString(input, "startDate") } : {}),
    ...(Object.hasOwn(input, "dueDate") ? { dueDate: optionalString(input, "dueDate") } : {}),
    ...(Object.hasOwn(input, "description") || Object.hasOwn(input, "notes")
      ? { description: optionalString(input, "description") ?? optionalString(input, "notes") }
      : {}),
    ...(Object.hasOwn(input, "visibility")
      ? { visibility: oneOf(input.visibility, ["private", "team", "workspace"] as const, "workspace") }
      : {}),
  };
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
  if (resourceType === "client") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"clients">), organizationId, "Client");
  if (resourceType === "calendarEvent") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"calendarEvents">), organizationId, "Calendar event");
  if (resourceType === "task") return assertActiveWorkspaceRecord(await ctx.db.get(resourceId as Id<"tasks">), organizationId, "Task");
  throw new Error("Unsupported media resource type.");
}

export async function assertDealLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: ReturnType<typeof dealInput>,
) {
  if (input.clientId) {
    const client = await ctx.db.get(input.clientId as Id<"clients">);
    assertActiveWorkspaceRecord(client, organizationId, "Client");
  }
  if (input.projectId) {
    const project = await ctx.db.get(input.projectId as Id<"projects">);
    assertActiveWorkspaceRecord(project, organizationId, "Project");
  }
}

export async function assertProjectLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: ReturnType<typeof projectInput>,
) {
  if (input.clientId) {
    const client = await ctx.db.get(input.clientId as Id<"clients">);
    assertActiveWorkspaceRecord(client, organizationId, "Client");
  }
  if (input.opportunityId) {
    const opportunity = await ctx.db.get(input.opportunityId as Id<"opportunities">);
    assertActiveWorkspaceRecord(opportunity, organizationId, "Opportunity");
  }
}
