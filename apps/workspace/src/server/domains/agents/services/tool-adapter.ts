import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { ToolSet } from "ai";
import { z } from "zod";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/better-auth/server";
import {
  allowedMcpTools,
  mcpToolCatalog,
  type McpPermission,
  type McpPermissionAction,
  type McpPermissionResource,
  type McpToolDefinition,
} from "@/server/protocols/mcp/tools/catalog";

type AgentToolResult = {
  tool: McpToolDefinition;
  status: "allowed" | "blocked" | "failed";
  input?: unknown;
  output?: unknown;
  error?: string;
};

type AgentToolRuntime = {
  organizationId: string;
  threadId: Id<"agentThreads">;
  onStatus?: (message: string) => Promise<void>;
  onToolResult?: (result: AgentToolResult) => Promise<void>;
};

type OrganizationCapabilities = Awaited<ReturnType<typeof fetchAuthQuery<typeof api.organizations.profile.access.getCapabilities>>>;

const stringId = z.string().min(1);
const optionalText = z.string().optional();
const listSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
  search: z.string().trim().max(160).optional(),
  cursor: z.string().nullable().optional(),
}).passthrough();
const visibilitySchema = z.enum(["private", "public"]).optional();
const clientInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["Buyer", "Tenant", "Investor", "Broker"]),
  contact: z.string(),
  phone: z.string(),
  age: z.number(),
  nationality: z.string(),
  generation: z.string(),
  budget: z.string(),
  propertyInterest: z.string(),
  status: z.enum(["active", "inactive"]),
  visibility: visibilitySchema,
  pipelineStage: z.enum(["new", "qualified", "viewing", "negotiation", "closed"]),
  pipelineOrder: z.number().optional(),
  priority: z.enum(["normal", "high", "urgent"]),
  nextAction: z.string(),
  issue: optionalText,
}).passthrough();
const propertyInputSchema = z.object({
  title: z.string().min(1),
  projectId: stringId.optional(),
  project: z.string(),
  city: z.string(),
  type: z.string(),
  status: z.enum(["available", "sold", "reserved", "pending", "draft"]),
  visibility: visibilitySchema,
  purpose: z.enum(["sale", "rent"]),
  price: z.string(),
  area: z.string(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  description: z.string(),
}).passthrough();
const projectInputSchema = z.object({
  name: z.string().min(1),
  developer: z.string(),
  city: z.string(),
  area: z.string(),
  type: z.string(),
  unitTypes: z.array(z.string()).optional(),
  status: z.enum(["draft", "pending", "approved", "rejected"]),
  visibility: visibilitySchema,
  units: z.number(),
  priceRange: z.string(),
  averagePrice: optionalText,
  projectPrices: z.array(z.object({ id: z.string(), label: z.string(), price: z.string() })).optional(),
  regaAuthorizationNo: optionalText,
  regaExpiresAt: optionalText,
  planNumber: optionalText,
  plotNumber: optionalText,
  postalIdentity: optionalText,
  description: z.string(),
}).passthrough();
const calendarInputSchema = z.object({
  title: z.string().min(1),
  owner: z.string(),
  startAt: z.number(),
  endAt: z.number().optional(),
  type: z.enum(["visit", "call", "meeting", "client-visit", "site-viewing", "appointment", "signing", "follow-up", "handover", "audit", "custom"]),
  status: z.enum(["confirmed", "pending", "draft"]),
  clientId: stringId.optional(),
  propertyId: stringId.optional(),
  projectId: stringId.optional(),
  taskId: stringId.optional(),
  location: optionalText,
  notes: optionalText,
  customFields: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
}).passthrough();
const taskInputSchema = z.object({
  clientId: stringId,
  title: z.string().min(1),
  status: z.enum(["open", "done", "canceled"]),
  visibility: visibilitySchema,
  priority: z.enum(["normal", "high", "urgent"]),
  dueAt: z.number().optional(),
  propertyId: stringId.optional(),
  projectId: stringId.optional(),
  calendarEventId: stringId.optional(),
  notes: optionalText,
}).passthrough();

function cleanInput<T extends z.ZodRawShape>(schema: z.ZodObject<T>, value: unknown) {
  return schema.strip().parse(value);
}

const toolInputSchemas: Record<string, z.ZodTypeAny> = {
  organization_info: z.object({}).passthrough(),
  clients_list: listSchema,
  clients_get: z.object({ clientId: stringId }).passthrough(),
  clients_create: clientInputSchema,
  clients_update: clientInputSchema.partial().extend({ clientId: stringId }).passthrough(),
  clients_delete: z.object({ clientId: stringId }).passthrough(),
  clients_link_unit: z.object({
    clientId: stringId,
    propertyId: stringId,
    status: z.enum(["interested", "shortlisted", "viewing", "offer", "rejected"]).optional(),
    notes: optionalText,
  }).passthrough(),
  clients_unlink_unit: z.object({ clientId: stringId, propertyId: stringId }).passthrough(),
  properties_list: listSchema,
  properties_get: z.object({ propertyId: stringId }).passthrough(),
  properties_open: z.object({ propertyId: stringId }).passthrough(),
  properties_create: propertyInputSchema,
  properties_update: propertyInputSchema.partial().extend({ propertyId: stringId }).passthrough(),
  properties_update_field: z.object({
    propertyId: stringId,
    field: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }).passthrough(),
  properties_delete: z.object({ propertyId: stringId }).passthrough(),
  projects_list: listSchema,
  projects_get: z.object({ projectId: stringId }).passthrough(),
  projects_create: projectInputSchema,
  projects_update: projectInputSchema.partial().extend({ projectId: stringId }).passthrough(),
  projects_delete: z.object({ projectId: stringId }).passthrough(),
  calendar_list_today: z.object({ limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  calendar_list_range: z.object({ startAt: z.number(), endAt: z.number(), limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  calendar_list_month: z.object({ year: z.number(), month: z.number().min(1).max(12), limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  calendar_get: z.object({ eventId: stringId }).passthrough(),
  calendar_create: calendarInputSchema,
  calendar_update: calendarInputSchema.partial().extend({ eventId: stringId }).passthrough(),
  calendar_delete: z.object({ eventId: stringId }).passthrough(),
  tasks_list: z.object({ clientId: stringId.optional(), limit: z.number().int().min(1).max(50).optional(), search: z.string().trim().max(160).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  tasks_get: z.object({ taskId: stringId }).passthrough(),
  tasks_create: taskInputSchema,
  tasks_update: taskInputSchema.partial().extend({ taskId: stringId }).passthrough(),
  tasks_complete: z.object({ taskId: stringId }).passthrough(),
  tasks_delete: z.object({ taskId: stringId }).passthrough(),
  media_list: z.object({ resourceType: z.enum(["project", "property", "client", "calendarEvent", "task"]), resourceId: stringId, limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  media_attach_url: z.object({
    resourceType: z.enum(["project", "property", "client", "calendarEvent", "task"]),
    resourceId: stringId,
    url: z.string().url(),
    name: z.string().min(1),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    kind: z.enum(["image", "document", "video"]).optional(),
    isCover: z.boolean().optional(),
  }).passthrough(),
};

function compact(value: unknown, maxItems = 50) {
  if (Array.isArray(value)) return value.slice(0, maxItems);
  if (value && typeof value === "object" && "page" in value && Array.isArray((value as { page?: unknown }).page)) {
    return { ...value, page: (value as { page: unknown[] }).page.slice(0, maxItems) };
  }
  return value;
}

function limit(input: { limit?: number }) {
  return Math.max(1, Math.min(input.limit ?? 25, 50));
}

function pagination(input: { limit?: number; cursor?: string | null }) {
  return { numItems: limit(input), cursor: input.cursor ?? null };
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { startAt: start.getTime(), endAt: end.getTime() };
}

function extensionName(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").filter(Boolean).at(-1);
    return name ? decodeURIComponent(name) : "External document";
  } catch {
    return "External document";
  }
}

function mediaKind(input: { kind?: "image" | "document" | "video"; mimeType?: string }) {
  if (input.kind) return input.kind;
  if (input.mimeType?.startsWith("image/")) return "image";
  if (input.mimeType?.startsWith("video/")) return "video";
  return "document";
}

function permissionsFromCapabilities(capabilities: OrganizationCapabilities): McpPermission[] {
  const actions = {
    organization: capabilities.canReadOrganization ? ["read"] : [],
    client: [
      capabilities.canReadClients && "read",
      capabilities.canCreateClients && "create",
      capabilities.canUpdateClients && "update",
      capabilities.canDeleteClients && "delete",
    ],
    property: [
      capabilities.canReadProperties && "read",
      capabilities.canCreateProperties && "create",
      capabilities.canUpdateProperties && "update",
      capabilities.canDeleteProperties && "delete",
    ],
    project: [
      capabilities.canReadProjects && "read",
      capabilities.canCreateProjects && "create",
      capabilities.canUpdateProjects && "update",
      capabilities.canDeleteProjects && "delete",
    ],
    calendar: [
      capabilities.canReadCalendarEvents && "read",
      capabilities.canCreateCalendarEvents && "create",
      capabilities.canUpdateCalendarEvents && "update",
      capabilities.canDeleteCalendarEvents && "delete",
    ],
    task: [
      capabilities.canReadTasks && "read",
      capabilities.canCreateTasks && "create",
      capabilities.canUpdateTasks && "update",
      capabilities.canDeleteTasks && "delete",
    ],
    media: [
      capabilities.canReadMedia && "read",
      capabilities.canCreateMedia && "create",
      capabilities.canUpdateMedia && "update",
      capabilities.canDeleteMedia && "delete",
    ],
  } satisfies Record<McpPermissionResource, Array<McpPermissionAction | false>>;

  return (Object.keys(actions) as McpPermissionResource[])
    .map((resource) => ({
      resource,
      actions: actions[resource].filter((action) => action !== false) as McpPermissionAction[],
    }))
    .filter((permission) => permission.actions.length > 0);
}

async function readMemory(runtime: AgentToolRuntime) {
  return fetchAuthQuery(api.agents.read.getThreadContext, {
    organizationId: runtime.organizationId,
    threadId: runtime.threadId,
    limit: 8,
  });
}

async function executeWorkspaceTool(runtime: AgentToolRuntime, tool: McpToolDefinition, rawInput: unknown) {
  const input = (rawInput && typeof rawInput === "object" ? rawInput : {}) as Record<string, unknown>;
  const organizationId = runtime.organizationId;

  switch (tool.name) {
    case "organization_info":
      return fetchAuthQuery(api.organizations.profile.read.getProfile, { organizationId });
    case "clients_list":
      return fetchAuthQuery(api.clients.read.listPaged, {
        organizationId,
        paginationOpts: pagination(input),
        search: input.search as string | undefined,
      });
    case "clients_get":
      return fetchAuthQuery(api.clients.read.get, { organizationId, clientId: input.clientId as Id<"clients"> });
    case "clients_create":
      return fetchAuthMutation(api.clients.write.createFromHono, {
        organizationId,
        input: cleanInput(clientInputSchema, input) as never,
      });
    case "clients_update": {
      const existing = await fetchAuthQuery(api.clients.read.get, { organizationId, clientId: input.clientId as Id<"clients"> });
      if (!existing) throw new Error("Client was not found.");
      const { clientId: _clientId, ...patch } = input;
      return fetchAuthMutation(api.clients.write.updateFromHono, {
        organizationId,
        clientId: input.clientId as Id<"clients">,
        input: cleanInput(clientInputSchema, { ...existing, ...patch }) as never,
      });
    }
    case "clients_delete":
      return fetchAuthMutation(api.clients.write.deleteFromHono, { organizationId, clientId: input.clientId as Id<"clients"> });
    case "clients_link_unit":
      return fetchAuthMutation(api.clients.write.linkUnitFromHono, {
        organizationId,
        input: {
          clientId: input.clientId as Id<"clients">,
          propertyId: input.propertyId as Id<"propertyUnits">,
          status: ((input.status as string | undefined) ?? "interested") as never,
          notes: input.notes as string | undefined,
        },
      });
    case "clients_unlink_unit":
      return fetchAuthMutation(api.clients.write.unlinkUnitFromHono, {
        organizationId,
        clientId: input.clientId as Id<"clients">,
        propertyId: input.propertyId as Id<"propertyUnits">,
      });
    case "properties_list":
      return fetchAuthQuery(api.properties.read.listPaged, {
        organizationId,
        paginationOpts: pagination(input),
        search: input.search as string | undefined,
      });
    case "properties_get":
    case "properties_open": {
      const property = await fetchAuthQuery(api.properties.read.get, { organizationId, propertyId: input.propertyId as Id<"propertyUnits"> });
      if (tool.name === "properties_get") return property;
      return { property, appUrl: property ? `/properties/${property.id}` : undefined };
    }
    case "properties_create":
      return fetchAuthMutation(api.properties.write.createFromHono, {
        organizationId,
        input: cleanInput(propertyInputSchema, input) as never,
      });
    case "properties_update":
    case "properties_update_field": {
      const existing = await fetchAuthQuery(api.properties.read.get, { organizationId, propertyId: input.propertyId as Id<"propertyUnits"> });
      if (!existing) throw new Error("Property unit was not found.");
      const { propertyId: _propertyId, field, value, ...patch } = input;
      const merged = tool.name === "properties_update_field"
        ? { ...existing, [String(field)]: value }
        : { ...existing, ...patch };
      return fetchAuthMutation(api.properties.write.updateFromHono, {
        organizationId,
        propertyId: input.propertyId as Id<"propertyUnits">,
        input: cleanInput(propertyInputSchema, merged) as never,
      });
    }
    case "properties_delete":
      return fetchAuthMutation(api.properties.write.deleteFromHono, { organizationId, propertyId: input.propertyId as Id<"propertyUnits"> });
    case "projects_list":
      return fetchAuthQuery(api.projects.read.listPaged, {
        organizationId,
        paginationOpts: pagination(input),
        search: input.search as string | undefined,
      });
    case "projects_get":
      return fetchAuthQuery(api.projects.read.get, { organizationId, projectId: input.projectId as Id<"projects"> });
    case "projects_create":
      return fetchAuthMutation(api.projects.write.createFromHono, {
        organizationId,
        input: cleanInput(projectInputSchema, input) as never,
      });
    case "projects_update": {
      const existing = await fetchAuthQuery(api.projects.read.get, { organizationId, projectId: input.projectId as Id<"projects"> });
      if (!existing) throw new Error("Project was not found.");
      const { projectId: _projectId, ...patch } = input;
      return fetchAuthMutation(api.projects.write.updateFromHono, {
        organizationId,
        projectId: input.projectId as Id<"projects">,
        input: cleanInput(projectInputSchema, { ...existing, ...patch }) as never,
      });
    }
    case "projects_delete":
      return fetchAuthMutation(api.projects.write.deleteFromHono, { organizationId, projectId: input.projectId as Id<"projects"> });
    case "calendar_list_today": {
      const startAt = startOfToday();
      return compact(await fetchAuthQuery(api.calendar.read.listRange, {
        organizationId,
        startAt,
        endAt: startAt + 24 * 60 * 60 * 1000,
      }), limit(input));
    }
    case "calendar_list_range":
      return compact(await fetchAuthQuery(api.calendar.read.listRange, {
        organizationId,
        startAt: input.startAt as number,
        endAt: input.endAt as number,
      }), limit(input));
    case "calendar_list_month": {
      const range = monthRange(input.year as number, input.month as number);
      return compact(await fetchAuthQuery(api.calendar.read.listRange, { organizationId, ...range }), limit(input));
    }
    case "calendar_get": {
      const events = await fetchAuthQuery(api.calendar.read.list, { organizationId });
      return events.find((event) => event.id === input.eventId || event._id === input.eventId) ?? null;
    }
    case "calendar_create":
      return fetchAuthMutation(api.calendar.write.createFromHono, {
        organizationId,
        input: cleanInput(calendarInputSchema, input) as never,
      });
    case "calendar_update": {
      const events = await fetchAuthQuery(api.calendar.read.list, { organizationId });
      const existing = events.find((event) => event.id === input.eventId || event._id === input.eventId);
      if (!existing) throw new Error("Calendar event was not found.");
      const { eventId: _eventId, ...patch } = input;
      return fetchAuthMutation(api.calendar.write.updateFromHono, {
        organizationId,
        eventId: input.eventId as Id<"calendarEvents">,
        input: cleanInput(calendarInputSchema, { ...existing, ...patch }) as never,
      });
    }
    case "calendar_delete":
      return fetchAuthMutation(api.calendar.write.deleteFromHono, { organizationId, eventId: input.eventId as Id<"calendarEvents"> });
    case "tasks_list": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, {
        organizationId,
        clientId: input.clientId as Id<"clients"> | undefined,
      });
      const search = typeof input.search === "string" ? input.search.trim().toLowerCase() : "";
      const filtered = search ? tasks.filter((task) => [task.title, task.notes].some((value) => value?.toLowerCase().includes(search))) : tasks;
      return compact(filtered, limit(input));
    }
    case "tasks_get": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, { organizationId });
      return tasks.find((task) => task.id === input.taskId || task._id === input.taskId) ?? null;
    }
    case "tasks_create":
      return fetchAuthMutation(api.clientTasks.write.createFromHono, {
        organizationId,
        input: cleanInput(taskInputSchema, input) as never,
      });
    case "tasks_update": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, { organizationId });
      const existing = tasks.find((task) => task.id === input.taskId || task._id === input.taskId);
      if (!existing) throw new Error("Task was not found.");
      const { taskId: _taskId, ...patch } = input;
      return fetchAuthMutation(api.clientTasks.write.updateFromHono, {
        organizationId,
        taskId: input.taskId as Id<"clientTasks">,
        input: cleanInput(taskInputSchema, { ...existing, ...patch }) as never,
      });
    }
    case "tasks_complete": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, { organizationId });
      const existing = tasks.find((task) => task.id === input.taskId || task._id === input.taskId);
      if (!existing) throw new Error("Task was not found.");
      return fetchAuthMutation(api.clientTasks.write.updateFromHono, {
        organizationId,
        taskId: input.taskId as Id<"clientTasks">,
        input: cleanInput(taskInputSchema, { ...existing, status: "done" }) as never,
      });
    }
    case "tasks_delete":
      return fetchAuthMutation(api.clientTasks.write.deleteFromHono, { organizationId, taskId: input.taskId as Id<"clientTasks"> });
    case "media_list":
      return compact(await fetchAuthQuery(api.media.read.listForResource, {
        organizationId,
        resourceType: input.resourceType as "project" | "property" | "client" | "calendarEvent" | "task",
        resourceId: input.resourceId as string,
      }), limit(input));
    case "media_attach_url":
      return fetchAuthMutation(api.media.write.attachFromHono, {
        organizationId,
        input: {
          key: `external:${input.url}`,
          url: input.url as string,
          name: (input.name as string | undefined) ?? extensionName(String(input.url)),
          mimeType: (input.mimeType as string | undefined) ?? "application/octet-stream",
          size: (input.size as number | undefined) ?? 0,
          kind: mediaKind(input as { kind?: "image" | "document" | "video"; mimeType?: string }),
          resourceType: input.resourceType as "project" | "property" | "client" | "calendarEvent" | "task",
          resourceId: input.resourceId as string,
          isCover: input.isCover as boolean | undefined,
        },
      });
    default:
      throw new Error("Tool is not implemented for in-app agent chat.");
  }
}

async function runLoggedTool(runtime: AgentToolRuntime, tool: McpToolDefinition, input: unknown) {
  await runtime.onStatus?.(tool.title);
  try {
    const output = await executeWorkspaceTool(runtime, tool, input);
    const result = { tool, status: "allowed" as const, input, output };
    await runtime.onToolResult?.(result);
    return { ok: true, tool: tool.name, data: output };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool failed.";
    const result = { tool, status: "failed" as const, input, error: message };
    await runtime.onToolResult?.(result);
    return { ok: false, tool: tool.name, error: message };
  }
}

export async function buildAgentToolSet(runtime: AgentToolRuntime): Promise<ToolSet> {
  const capabilities = await fetchAuthQuery(api.organizations.profile.access.getCapabilities, {
    organizationId: runtime.organizationId,
  });
  const allowedTools = allowedMcpTools(permissionsFromCapabilities(capabilities));
  const toolSet: ToolSet = {};

  for (const tool of allowedTools) {
    toolSet[tool.name] = {
      description: [
        tool.description,
        tool.action === "read"
          ? "Use only when the user needs current workspace data."
          : "Use only when the user clearly asked to change workspace data and all required fields are known.",
      ].join(" "),
      inputSchema: toolInputSchemas[tool.name] ?? z.object(tool.inputSchema ?? {}).passthrough(),
      execute: (input: unknown) => runLoggedTool(runtime, tool, input),
    };
  }

  if (allowedTools.some((tool) => tool.resource === "organization" && tool.action === "read")) {
    const memoryTool = mcpToolCatalog.find((tool) => tool.name === "organization_info") ?? allowedTools[0];
    toolSet.conversation_memory = {
      description: "Read recent messages, summary, and remembered facts for this current AI thread. Use only for follow-ups, references like this/that/it, or explicit memory requests.",
      inputSchema: z.object({}).passthrough(),
      execute: async () => {
        await runtime.onStatus?.("Reading conversation memory");
        try {
          const output = await readMemory(runtime);
          await runtime.onToolResult?.({
            tool: { ...memoryTool, name: "conversation_memory", title: "Conversation memory", description: "Read current thread memory." },
            status: "allowed",
            output,
          });
          return { ok: true, tool: "conversation_memory", data: output };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Memory lookup failed.";
          await runtime.onToolResult?.({
            tool: { ...memoryTool, name: "conversation_memory", title: "Conversation memory", description: "Read current thread memory." },
            status: "failed",
            error: message,
          });
          return { ok: false, tool: "conversation_memory", error: message };
        }
      },
    };
  }

  return toolSet;
}

export type { AgentToolResult };
