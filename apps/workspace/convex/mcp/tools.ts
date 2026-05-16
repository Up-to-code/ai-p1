import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { protectClientPii, revealClientPii } from "../security/clientPii";

type Input = Record<string, unknown>;
type ToolPermission = {
  resource: "organization" | "client" | "property" | "project" | "calendar" | "task" | "media";
  action: "read" | "create" | "update" | "delete";
};

const toolPermissions: Record<string, ToolPermission> = {
  organization_info: { resource: "organization", action: "read" },
  clients_list: { resource: "client", action: "read" },
  clients_get: { resource: "client", action: "read" },
  clients_create: { resource: "client", action: "create" },
  clients_update: { resource: "client", action: "update" },
  clients_delete: { resource: "client", action: "delete" },
  clients_link_unit: { resource: "client", action: "update" },
  clients_unlink_unit: { resource: "client", action: "update" },
  properties_list: { resource: "property", action: "read" },
  properties_get: { resource: "property", action: "read" },
  properties_open: { resource: "property", action: "read" },
  properties_create: { resource: "property", action: "create" },
  properties_update: { resource: "property", action: "update" },
  properties_update_field: { resource: "property", action: "update" },
  properties_delete: { resource: "property", action: "delete" },
  projects_list: { resource: "project", action: "read" },
  projects_get: { resource: "project", action: "read" },
  projects_create: { resource: "project", action: "create" },
  projects_update: { resource: "project", action: "update" },
  projects_delete: { resource: "project", action: "delete" },
  calendar_list_today: { resource: "calendar", action: "read" },
  calendar_list_range: { resource: "calendar", action: "read" },
  calendar_list_month: { resource: "calendar", action: "read" },
  calendar_get: { resource: "calendar", action: "read" },
  calendar_create: { resource: "calendar", action: "create" },
  calendar_update: { resource: "calendar", action: "update" },
  calendar_delete: { resource: "calendar", action: "delete" },
  tasks_list: { resource: "task", action: "read" },
  tasks_get: { resource: "task", action: "read" },
  tasks_create: { resource: "task", action: "create" },
  tasks_update: { resource: "task", action: "update" },
  tasks_complete: { resource: "task", action: "update" },
  tasks_delete: { resource: "task", action: "delete" },
  media_list: { resource: "media", action: "read" },
  media_attach_url: { resource: "media", action: "create" },
};

const readTools = new Set([
  "organization_info",
  "clients_list",
  "clients_get",
  "properties_list",
  "properties_get",
  "properties_open",
  "projects_list",
  "projects_get",
  "calendar_list_today",
  "calendar_list_range",
  "calendar_list_month",
  "calendar_get",
  "tasks_list",
  "tasks_get",
  "media_list",
]);

export const mcpToolPermissionMap = toolPermissions;
export const mcpReadToolNames = readTools;

const DEFAULT_TOOL_LIST_LIMIT = 25;
const MAX_TOOL_LIST_LIMIT = 50;
const TOOL_SCAN_LIMIT = 200;

function inputObject(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Input)
    : {};
}

function requiredString(input: Input, key: string) {
  const value = input[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }
  return value;
}

function optionalString(input: Input, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function optionalNumber(input: Input, key: string) {
  const value = input[key];
  return typeof value === "number" ? value : undefined;
}

function listLimit(input: Input) {
  const value = optionalNumber(input, "limit");
  if (value === undefined) return DEFAULT_TOOL_LIST_LIMIT;
  if (!Number.isInteger(value) || value < 1 || value > MAX_TOOL_LIST_LIMIT) {
    throw new Error(`limit must be an integer from 1 to ${MAX_TOOL_LIST_LIMIT}.`);
  }
  return value;
}

function listCursor(input: Input) {
  const value = input.cursor;
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new Error("cursor must be a string or null.");
  return value;
}

function searchTerm(input: Input) {
  const value = optionalString(input, "search");
  return value?.trim().toLowerCase();
}

function matchesSearch(search: string | undefined, values: string[]) {
  if (!search) return true;
  return values.some((value) => value.toLowerCase().includes(search));
}

function requiredNumber(input: Input, key: string) {
  const value = input[key];
  if (typeof value !== "number") throw new Error(`${key} is required.`);
  return value;
}

function present<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

function pagedResult<T>(
  page: { page: T[]; isDone: boolean; continueCursor: string },
  mapItem: (item: T) => unknown,
) {
  return {
    items: page.page.map(mapItem),
    isDone: page.isDone,
    continueCursor: page.continueCursor,
  };
}

function cappedSearchResult<T>(items: T[], mapItem: (item: T) => unknown) {
  return {
    items: items.map(mapItem),
    isDone: true,
    continueCursor: "",
  };
}

function assertActiveOrganization<T extends { organizationId: string; deletedAt?: number }>(
  doc: T | null,
  organizationId: string,
  label: string,
) {
  if (!doc || doc.organizationId !== organizationId || doc.deletedAt) {
    throw new Error(`${label} was not found.`);
  }
  return doc;
}

function isPublicRecord(doc: { visibility?: "private" | "public" }) {
  return (doc.visibility ?? "private") === "public";
}

function assertPublicRecord<T extends { visibility?: "private" | "public" }>(doc: T, label: string) {
  if (!isPublicRecord(doc)) {
    throw new Error(`${label} was not found.`);
  }
  return doc;
}

function hasConnectionPermission(
  permissions: unknown[],
  resource: ToolPermission["resource"],
  action: ToolPermission["action"],
) {
  return permissions.some((permission) => {
    if (!permission || typeof permission !== "object" || Array.isArray(permission)) return false;
    const candidate = permission as { resource?: unknown; actions?: unknown };
    return (
      candidate.resource === resource &&
      Array.isArray(candidate.actions) &&
      candidate.actions.includes(action)
    );
  });
}

function assertConnectionPermission(
  permissions: unknown[],
  resource: ToolPermission["resource"],
  action: ToolPermission["action"],
) {
  if (!hasConnectionPermission(permissions, resource, action)) {
    throw new Error(`Agent link is not allowed to ${action} ${resource}.`);
  }
}

function mediaResourcePermission(
  resourceType: "project" | "property" | "client" | "calendarEvent" | "task",
) {
  if (resourceType === "calendarEvent") return "calendar";
  return resourceType;
}

function actor(connectionId: string) {
  return `mcp:${connectionId}`;
}

async function audit(
  ctx: MutationCtx,
  organizationId: string,
  connectionId: string,
  actionName: string,
  target: string,
  summary: string,
) {
  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actor(connectionId),
    actorType: "mcpConnection",
    actorMcpConnectionId: connectionId,
    action: actionName,
    target,
    summary,
    createdAt: Date.now(),
  });
}

export const callTool = action({
  args: {
    publicId: v.string(),
    secret: v.string(),
    tool: v.string(),
    input: v.optional(v.any()),
    appBaseUrl: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<unknown> => {
    const permission = toolPermissions[args.tool];
    if (!permission) throw new Error("Unknown tool.");

    const validation = await ctx.runQuery(api.mcp.connections.validateConnection, {
      publicId: args.publicId,
      secret: args.secret,
      resource: permission.resource,
      action: permission.action,
    });
    if (!validation.ok || !validation.organizationId || !validation.connectionId || !validation.keyId) {
      throw new Error(validation.reason ?? "Agent link is not allowed.");
    }

    const reserved = await ctx.runMutation(internal.mcp.connections.reserveUsage, {
      organizationId: validation.organizationId,
      connectionId: validation.connectionId,
      keyId: validation.keyId,
      tool: args.tool,
    });
    if (!reserved.ok) throw new Error(reserved.reason ?? "Agent link is not available.");

    const common = {
      organizationId: validation.organizationId,
      connectionId: validation.connectionId,
      tool: args.tool,
      input: inputObject(args.input),
      appBaseUrl: args.appBaseUrl,
      permissions: validation.permissions ?? [],
      instructions: validation.instructions,
      connectionName: validation.name,
    };

    return readTools.has(args.tool)
      ? await ctx.runQuery(internal.mcp.tools.readTool, common)
      : await ctx.runMutation(internal.mcp.tools.writeTool, common);
  },
});

export const readTool = internalQuery({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationMcpConnections"),
    tool: v.string(),
    input: v.any(),
    appBaseUrl: v.optional(v.string()),
    permissions: v.array(v.any()),
    instructions: v.optional(v.string()),
    connectionName: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const input = inputObject(args.input);

    if (args.tool === "organization_info") {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .first();
      return {
        organization,
        agentLink: {
          id: args.connectionId,
          name: args.connectionName,
          instructions: args.instructions,
          permissions: args.permissions,
        },
      };
    }

    if (args.tool === "clients_list") {
      const limit = listLimit(input);
      const search = searchTerm(input);
      if (!search) {
        const page = await ctx.db
          .query("clients")
          .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
          .order("desc")
          .paginate({ numItems: limit, cursor: listCursor(input) });
        return pagedResult(
          {
            ...page,
            page: page.page.filter((client) => !client.deletedAt && isPublicRecord(client)),
          },
          present,
        );
      }
      const clients = await ctx.db
        .query("clients")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(TOOL_SCAN_LIMIT);
      return cappedSearchResult(clients
        .filter((client) => !client.deletedAt)
        .filter(isPublicRecord)
        .filter((client) => matchesSearch(search, [client.name, client.contact, client.propertyInterest, client.budget]))
        .slice(0, limit), present);
    }

    if (args.tool === "clients_get") {
      const client = await ctx.db.get(requiredString(input, "clientId") as Id<"clients">);
      return present(assertPublicRecord(assertActiveOrganization(client, args.organizationId, "Client"), "Client"));
    }

    if (args.tool === "properties_list") {
      const limit = listLimit(input);
      const search = searchTerm(input);
      if (!search) {
        const page = await ctx.db
          .query("propertyUnits")
          .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
          .order("desc")
          .paginate({ numItems: limit, cursor: listCursor(input) });
        return pagedResult(
          {
            ...page,
            page: page.page.filter((unit) => !unit.deletedAt && isPublicRecord(unit)),
          },
          present,
        );
      }
      const units = await ctx.db
        .query("propertyUnits")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(TOOL_SCAN_LIMIT);
      return cappedSearchResult(units
        .filter((unit) => !unit.deletedAt)
        .filter(isPublicRecord)
        .filter((unit) => matchesSearch(search, [unit.title, unit.project, unit.city, unit.reference]))
        .slice(0, limit), present);
    }

    if (args.tool === "properties_get" || args.tool === "properties_open") {
      const propertyId = requiredString(input, "propertyId");
      const property = await ctx.db.get(propertyId as Id<"propertyUnits">);
      const result = present(assertPublicRecord(assertActiveOrganization(property, args.organizationId, "Property unit"), "Property unit"));
      return args.tool === "properties_open"
        ? { ...result, appUrl: `${args.appBaseUrl ?? ""}/properties/${propertyId}` }
        : result;
    }

    if (args.tool === "projects_list") {
      const limit = listLimit(input);
      const search = searchTerm(input);
      if (!search) {
        const page = await ctx.db
          .query("projects")
          .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
          .order("desc")
          .paginate({ numItems: limit, cursor: listCursor(input) });
        return pagedResult(
          {
            ...page,
            page: page.page.filter((project) => !project.deletedAt && isPublicRecord(project)),
          },
          present,
        );
      }
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(TOOL_SCAN_LIMIT);
      return cappedSearchResult(projects
        .filter((project) => !project.deletedAt)
        .filter(isPublicRecord)
        .filter((project) => matchesSearch(search, [project.name, project.reference, project.city, project.developer]))
        .slice(0, limit), present);
    }

    if (args.tool === "projects_get") {
      const project = await ctx.db.get(requiredString(input, "projectId") as Id<"projects">);
      return present(assertPublicRecord(assertActiveOrganization(project, args.organizationId, "Project"), "Project"));
    }

    if (args.tool === "calendar_list_today") {
      const now = new Date();
      const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const end = start + 24 * 60 * 60 * 1000;
      return listEvents(ctx, args.organizationId, start, end, listLimit(input), listCursor(input));
    }

    if (args.tool === "calendar_list_range") {
      return listEvents(ctx, args.organizationId, requiredNumber(input, "startAt"), requiredNumber(input, "endAt"), listLimit(input), listCursor(input));
    }

    if (args.tool === "calendar_list_month") {
      const year = requiredNumber(input, "year");
      const month = requiredNumber(input, "month");
      const start = Date.UTC(year, month - 1, 1);
      const end = Date.UTC(year, month, 1);
      return listEvents(ctx, args.organizationId, start, end, listLimit(input), listCursor(input));
    }

    if (args.tool === "calendar_get") {
      const event = await ctx.db.get(requiredString(input, "eventId") as Id<"calendarEvents">);
      return present(assertActiveOrganization(event, args.organizationId, "Calendar event"));
    }

    if (args.tool === "tasks_list") {
      const clientId = optionalString(input, "clientId");
      const limit = listLimit(input);
      const search = searchTerm(input);
      if (!search) {
        const page = clientId
          ? await ctx.db
              .query("clientTasks")
              .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId as Id<"clients">))
              .order("desc")
              .paginate({ numItems: limit, cursor: listCursor(input) })
          : await ctx.db
              .query("clientTasks")
              .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
              .order("desc")
              .paginate({ numItems: limit, cursor: listCursor(input) });
        return pagedResult(
          {
            ...page,
            page: page.page.filter((task) => !task.deletedAt && isPublicRecord(task)),
          },
          present,
        );
      }
      const tasks = clientId
        ? await ctx.db
            .query("clientTasks")
            .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId as Id<"clients">))
            .take(TOOL_SCAN_LIMIT)
        : await ctx.db
            .query("clientTasks")
            .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
            .take(TOOL_SCAN_LIMIT);
      return cappedSearchResult(tasks
        .filter((task) => !task.deletedAt)
        .filter(isPublicRecord)
        .filter((task) => matchesSearch(search, [task.title, task.notes ?? ""]))
        .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0))
        .slice(0, limit), present);
    }

    if (args.tool === "tasks_get") {
      const task = await ctx.db.get(requiredString(input, "taskId") as Id<"clientTasks">);
      return present(assertPublicRecord(assertActiveOrganization(task, args.organizationId, "Task"), "Task"));
    }

    if (args.tool === "media_list") {
      const limit = listLimit(input);
      const resourceType = requiredString(input, "resourceType") as "project" | "property" | "client" | "calendarEvent" | "task";
      assertConnectionPermission(args.permissions, mediaResourcePermission(resourceType), "read");
      const page = await ctx.db
        .query("mediaAssets")
        .withIndex("by_organization_resource", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("resourceType", resourceType)
            .eq("resourceId", requiredString(input, "resourceId")),
        )
        .paginate({ numItems: limit, cursor: listCursor(input) });
      return pagedResult(
        {
          ...page,
          page: page.page
            .filter((asset) => (asset.shareVisibility ?? "private") === "public")
            .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt),
        },
        (asset) => asset,
      );
    }

    throw new Error("Unsupported read tool.");
  },
});

export const writeTool = internalMutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationMcpConnections"),
    tool: v.string(),
    input: v.any(),
    appBaseUrl: v.optional(v.string()),
    permissions: v.array(v.any()),
    instructions: v.optional(v.string()),
    connectionName: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const input = inputObject(args.input);
    const now = Date.now();
    const actorId = actor(args.connectionId);

    if (args.tool === "clients_create") {
      const client = clientInput(input);
      const id = await ctx.db.insert("clients", {
        organizationId: args.organizationId,
        ...client,
        ...await protectClientPii(args.organizationId, client),
        isDeleted: false,
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "client.create", id, `Created client ${requiredString(input, "name")}.`);
      return present((await ctx.db.get(id))!);
    }

    if (args.tool === "clients_update") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const existing = assertActiveOrganization(await ctx.db.get(clientId), args.organizationId, "Client");
      const revealed = await revealClientPii(existing);
      const client = clientInput({ ...existing, ...revealed, ...input });
      await ctx.db.patch(clientId, { ...client, ...await protectClientPii(args.organizationId, client), updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.update", clientId, `Updated client ${requiredString(input, "name") || existing.name}.`);
      return present((await ctx.db.get(clientId))!);
    }

    if (args.tool === "clients_delete") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const existing = assertActiveOrganization(await ctx.db.get(clientId), args.organizationId, "Client");
      await ctx.db.patch(clientId, { deletedAt: now, isDeleted: true, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.delete", clientId, `Deleted client ${existing.name}.`);
      return { removed: true };
    }

    if (args.tool === "clients_link_unit") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const propertyId = requiredString(input, "propertyId") as Id<"propertyUnits">;
      assertActiveOrganization(await ctx.db.get(clientId), args.organizationId, "Client");
      assertActiveOrganization(await ctx.db.get(propertyId), args.organizationId, "Property unit");
      const existing = await ctx.db
        .query("clientUnitLinks")
        .withIndex("by_client_property", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId).eq("propertyId", propertyId))
        .first();
      const status = clientUnitStatus(input);
      if (existing && !existing.deletedAt) {
        await ctx.db.patch(existing._id, { status, notes: optionalString(input, "notes"), updatedAt: now });
        await audit(ctx, args.organizationId, args.connectionId, "client.unit.link", clientId, "Updated a client apartment link.");
        return present((await ctx.db.get(existing._id))!);
      }
      const id = await ctx.db.insert("clientUnitLinks", {
        organizationId: args.organizationId,
        clientId,
        propertyId,
        status,
        notes: optionalString(input, "notes"),
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "client.unit.link", clientId, "Linked a client to an apartment.");
      return present((await ctx.db.get(id))!);
    }

    if (args.tool === "clients_unlink_unit") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const propertyId = requiredString(input, "propertyId") as Id<"propertyUnits">;
      const existing = await ctx.db
        .query("clientUnitLinks")
        .withIndex("by_client_property", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId).eq("propertyId", propertyId))
        .first();
      if (existing && !existing.deletedAt) await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.unit.unlink", clientId, "Unlinked a client from an apartment.");
      return { removed: true };
    }

    if (args.tool === "properties_create") {
      await assertOptionalProject(ctx, args.organizationId, optionalString(input, "projectId"));
      const id = await ctx.db.insert("propertyUnits", {
        organizationId: args.organizationId,
        ...propertyInput(input),
        reference: reference("UNT", now),
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "property.create", id, `Created apartment ${requiredString(input, "title")}.`);
      return present((await ctx.db.get(id))!);
    }

    if (args.tool === "properties_update" || args.tool === "properties_update_field") {
      const propertyId = requiredString(input, "propertyId") as Id<"propertyUnits">;
      const existing = assertActiveOrganization(await ctx.db.get(propertyId), args.organizationId, "Property unit");
      const patch = args.tool === "properties_update_field"
        ? propertyFieldPatch(input)
        : propertyInput({ ...existing, ...input });
      if (args.tool === "properties_update") {
        await assertOptionalProject(ctx, args.organizationId, optionalString({ ...existing, ...input }, "projectId"));
      }
      await ctx.db.patch(propertyId, { ...patch, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "property.update", propertyId, `Updated apartment ${existing.title}.`);
      return present((await ctx.db.get(propertyId))!);
    }

    if (args.tool === "properties_delete") {
      const propertyId = requiredString(input, "propertyId") as Id<"propertyUnits">;
      const existing = assertActiveOrganization(await ctx.db.get(propertyId), args.organizationId, "Property unit");
      await ctx.db.patch(propertyId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "property.delete", propertyId, `Deleted apartment ${existing.title}.`);
      return { removed: true };
    }

    if (args.tool === "projects_create") {
      const id = await ctx.db.insert("projects", {
        organizationId: args.organizationId,
        ...projectInput(input),
        reference: reference("PRJ", now),
        syncState: projectStatus(input) === "approved" ? "synced" : "draft",
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "project.create", id, `Created project ${requiredString(input, "name")}.`);
      return present((await ctx.db.get(id))!);
    }

    if (args.tool === "projects_update") {
      const projectId = requiredString(input, "projectId") as Id<"projects">;
      const existing = assertActiveOrganization(await ctx.db.get(projectId), args.organizationId, "Project");
      const patch = projectInput({ ...existing, ...input });
      await ctx.db.patch(projectId, { ...patch, syncState: patch.status === "approved" ? "synced" : "draft", updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "project.update", projectId, `Updated project ${existing.name}.`);
      return present((await ctx.db.get(projectId))!);
    }

    if (args.tool === "projects_delete") {
      const projectId = requiredString(input, "projectId") as Id<"projects">;
      const existing = assertActiveOrganization(await ctx.db.get(projectId), args.organizationId, "Project");
      await ctx.db.patch(projectId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "project.delete", projectId, `Deleted project ${existing.name}.`);
      return { removed: true };
    }

    if (args.tool === "calendar_create") {
      await assertCalendarLinks(ctx, args.organizationId, calendarInput(input));
      const id = await ctx.db.insert("calendarEvents", {
        organizationId: args.organizationId,
        ...calendarInput(input),
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "calendar.create", id, `Scheduled ${requiredString(input, "title")}.`);
      return present((await ctx.db.get(id))!);
    }

    if (args.tool === "calendar_update") {
      const eventId = requiredString(input, "eventId") as Id<"calendarEvents">;
      const existing = assertActiveOrganization(await ctx.db.get(eventId), args.organizationId, "Calendar event");
      const patch = calendarInput({ ...existing, ...input });
      await assertCalendarLinks(ctx, args.organizationId, patch);
      await ctx.db.patch(eventId, { ...patch, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "calendar.update", eventId, `Updated ${existing.title}.`);
      return present((await ctx.db.get(eventId))!);
    }

    if (args.tool === "calendar_delete") {
      const eventId = requiredString(input, "eventId") as Id<"calendarEvents">;
      const existing = assertActiveOrganization(await ctx.db.get(eventId), args.organizationId, "Calendar event");
      await ctx.db.patch(eventId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "calendar.delete", eventId, `Deleted ${existing.title}.`);
      return { removed: true };
    }

    if (args.tool === "tasks_create") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      assertActiveOrganization(await ctx.db.get(clientId), args.organizationId, "Client");
      await assertTaskLinks(ctx, args.organizationId, taskInput(input));
      const id = await ctx.db.insert("clientTasks", {
        organizationId: args.organizationId,
        ...taskInput(input),
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
        ...(taskStatus(input) === "done" ? { completedAt: now } : {}),
      });
      await audit(ctx, args.organizationId, args.connectionId, "client.task.create", clientId, `Created task ${requiredString(input, "title")}.`);
      return present((await ctx.db.get(id))!);
    }

    if (args.tool === "tasks_update" || args.tool === "tasks_complete") {
      const taskId = requiredString(input, "taskId") as Id<"clientTasks">;
      const existing = assertActiveOrganization(await ctx.db.get(taskId), args.organizationId, "Task");
      const patch = args.tool === "tasks_complete"
        ? { status: "done" as const, completedAt: existing.completedAt ?? now }
        : taskInput({ ...existing, ...input });
      if (args.tool === "tasks_update") {
        await assertTaskLinks(ctx, args.organizationId, patch);
      }
      await ctx.db.patch(taskId, { ...patch, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Updated task ${existing.title}.`);
      return present((await ctx.db.get(taskId))!);
    }

    if (args.tool === "tasks_delete") {
      const taskId = requiredString(input, "taskId") as Id<"clientTasks">;
      const existing = assertActiveOrganization(await ctx.db.get(taskId), args.organizationId, "Task");
      await ctx.db.patch(taskId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.task.delete", taskId, `Deleted task ${existing.title}.`);
      return { removed: true };
    }

    if (args.tool === "media_attach_url") {
      await assertMediaResource(ctx, args.organizationId, input);
      const resourceType = requiredString(input, "resourceType") as "project" | "property" | "client" | "calendarEvent" | "task";
      assertConnectionPermission(args.permissions, mediaResourcePermission(resourceType), "update");
      const resourceId = requiredString(input, "resourceId");
      const existing = await ctx.db
        .query("mediaAssets")
        .withIndex("by_organization_resource", (q) => q.eq("organizationId", args.organizationId).eq("resourceType", resourceType).eq("resourceId", resourceId))
        .take(TOOL_SCAN_LIMIT);
      const id = await ctx.db.insert("mediaAssets", {
        organizationId: args.organizationId,
        key: `external:${requiredString(input, "url")}`,
        url: requiredString(input, "url"),
        name: requiredString(input, "name"),
        mimeType: optionalString(input, "mimeType") ?? "application/octet-stream",
        size: optionalNumber(input, "size") ?? 0,
        kind: mediaKind(input),
        resourceType,
        resourceId,
        sortOrder: existing.length,
        shareVisibility: "private",
        isCover: false,
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, `${resourceType}.media.attach`, resourceId, `Attached ${requiredString(input, "name")}.`);
      return (await ctx.db.get(id))!;
    }

    throw new Error("Unsupported write tool.");
  },
});

async function listEvents(
  ctx: QueryCtx,
  organizationId: string,
  startAt: number,
  endAt: number,
  limit: number,
  cursor: string | null,
) {
  const page = await ctx.db
    .query("calendarEvents")
    .withIndex("by_start", (q) => q.eq("organizationId", organizationId).gte("startAt", startAt).lt("startAt", endAt))
    .paginate({ numItems: limit, cursor });
  return pagedResult(
    {
      ...page,
      page: page.page.filter((event) => !event.deletedAt).sort((a, b) => a.startAt - b.startAt),
    },
    present,
  );
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function clientInput(input: Input) {
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

function propertyInput(input: Input) {
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

function propertyFieldPatch(input: Input) {
  const field = requiredString(input, "field");
  const allowed = new Set(["title", "project", "city", "type", "status", "purpose", "price", "area", "bedrooms", "bathrooms", "description"]);
  if (!allowed.has(field)) throw new Error("This apartment field cannot be edited by MCP.");
  return { [field]: input.value };
}

function projectStatus(input: Input) {
  return oneOf(input.status, ["draft", "pending", "approved", "rejected"] as const, "draft");
}

function projectInput(input: Input) {
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

function calendarInput(input: Input) {
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

function taskStatus(input: Input) {
  return oneOf(input.status, ["open", "done", "canceled"] as const, "open");
}

function taskInput(input: Input) {
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

function clientUnitStatus(input: Input) {
  return oneOf(input.status, ["interested", "shortlisted", "viewing", "offer", "rejected"] as const, "interested");
}

function mediaKind(input: Input) {
  return oneOf(input.kind, ["image", "video", "document"] as const, "document");
}

function reference(prefix: string, now: number) {
  return `${prefix}-${now.toString(36).toUpperCase().slice(-6)}`;
}

async function assertMediaResource(
  ctx: MutationCtx,
  organizationId: string,
  input: Input,
) {
  const resourceType = requiredString(input, "resourceType");
  const resourceId = requiredString(input, "resourceId");
  if (resourceType === "project") return assertActiveOrganization(await ctx.db.get(resourceId as Id<"projects">), organizationId, "Project");
  if (resourceType === "property") return assertActiveOrganization(await ctx.db.get(resourceId as Id<"propertyUnits">), organizationId, "Property unit");
  if (resourceType === "client") return assertActiveOrganization(await ctx.db.get(resourceId as Id<"clients">), organizationId, "Client");
  if (resourceType === "calendarEvent") return assertActiveOrganization(await ctx.db.get(resourceId as Id<"calendarEvents">), organizationId, "Calendar event");
  if (resourceType === "task") return assertActiveOrganization(await ctx.db.get(resourceId as Id<"clientTasks">), organizationId, "Task");
  throw new Error("Unsupported media resource type.");
}

async function assertOptionalProject(ctx: MutationCtx, organizationId: string, projectId?: string) {
  if (!projectId) return;
  assertActiveOrganization(await ctx.db.get(projectId as Id<"projects">), organizationId, "Project");
}

async function assertCalendarLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: ReturnType<typeof calendarInput>,
) {
  if (input.clientId) assertActiveOrganization(await ctx.db.get(input.clientId), organizationId, "Client");
  if (input.propertyId) assertActiveOrganization(await ctx.db.get(input.propertyId), organizationId, "Property unit");
  if (input.projectId) assertActiveOrganization(await ctx.db.get(input.projectId), organizationId, "Project");
  if (input.taskId) assertActiveOrganization(await ctx.db.get(input.taskId), organizationId, "Task");
}

async function assertTaskLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: ReturnType<typeof taskInput> | { status: "done"; completedAt: number },
) {
  if (!("clientId" in input)) return;
  assertActiveOrganization(await ctx.db.get(input.clientId), organizationId, "Client");
  if (input.propertyId) assertActiveOrganization(await ctx.db.get(input.propertyId), organizationId, "Property unit");
  if (input.projectId) assertActiveOrganization(await ctx.db.get(input.projectId), organizationId, "Project");
  if (input.calendarEventId) assertActiveOrganization(await ctx.db.get(input.calendarEventId), organizationId, "Calendar event");
}
