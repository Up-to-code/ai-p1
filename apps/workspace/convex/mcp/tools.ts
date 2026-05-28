import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { protectClientPii, revealClientPii } from "../security/clientPii";
import {
  assertActiveWorkspaceRecord,
  assertPublicWorkspaceRecord,
  mcpActor,
  presentWorkspaceRecord,
  workspaceReference,
  writeMcpWorkspaceAudit,
} from "../workspace/businessData";
import { executeMcpToolCall } from "./toolCall";
import {
  mcpCalendarEventPage,
  mcpPublicMediaPage,
  mcpPublicWorkspacePage,
  mcpPublicWorkspaceSearchResult,
} from "./readSurface";
import {
  mcpReadToolNames as readTools,
  mcpToolPermissionMap as toolPermissions,
  type ToolPermission,
} from "./toolRegistry";
import {
  assertCalendarLinks,
  assertMediaResource,
  assertOptionalProject,
  assertTaskLinks,
  calendarInput,
  clientInput,
  clientUnitStatus,
  inputObject,
  listCursor,
  listLimit,
  mediaKind,
  optionalNumber,
  optionalString,
  projectInput,
  projectStatus,
  propertyFieldPatch,
  propertyInput,
  requiredNumber,
  requiredString,
  searchTerm,
  taskInput,
  taskStatus,
  type Input,
} from "./toolInputs";

export const mcpToolPermissionMap = toolPermissions;
export const mcpReadToolNames = readTools;

const TOOL_SCAN_LIMIT = 200;

const clientSearchValues = (client: { name: string; contact: string; propertyInterest: string; budget: string }) => [
  client.name,
  client.contact,
  client.propertyInterest,
  client.budget,
];

const propertySearchValues = (unit: { title: string; project: string; city: string; reference: string }) => [
  unit.title,
  unit.project,
  unit.city,
  unit.reference,
];

const projectSearchValues = (project: { name: string; reference: string; city: string; developer: string }) => [
  project.name,
  project.reference,
  project.city,
  project.developer,
];

const taskSearchValues = (task: { title: string; notes?: string }) => [
  task.title,
  task.notes ?? "",
];

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

async function audit(
  ctx: MutationCtx,
  organizationId: string,
  connectionId: string,
  actionName: string,
  target: string,
  summary: string,
) {
  await writeMcpWorkspaceAudit(ctx, {
    organizationId,
    connectionId,
    action: actionName,
    target,
    summary,
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
    return executeMcpToolCall(ctx, args);
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
        return mcpPublicWorkspacePage(page);
      }
      const clients = await ctx.db
        .query("clients")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(TOOL_SCAN_LIMIT);
      return mcpPublicWorkspaceSearchResult(clients, {
        search,
        limit,
        searchValues: clientSearchValues,
      });
    }

    if (args.tool === "clients_get") {
      const client = await ctx.db.get(requiredString(input, "clientId") as Id<"clients">);
      return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(client, args.organizationId, "Client"), "Client"));
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
        return mcpPublicWorkspacePage(page);
      }
      const units = await ctx.db
        .query("propertyUnits")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(TOOL_SCAN_LIMIT);
      return mcpPublicWorkspaceSearchResult(units, {
        search,
        limit,
        searchValues: propertySearchValues,
      });
    }

    if (args.tool === "properties_get" || args.tool === "properties_open") {
      const propertyId = requiredString(input, "propertyId");
      const property = await ctx.db.get(propertyId as Id<"propertyUnits">);
      const result = presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(property, args.organizationId, "Property unit"), "Property unit"));
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
        return mcpPublicWorkspacePage(page);
      }
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(TOOL_SCAN_LIMIT);
      return mcpPublicWorkspaceSearchResult(projects, {
        search,
        limit,
        searchValues: projectSearchValues,
      });
    }

    if (args.tool === "projects_get") {
      const project = await ctx.db.get(requiredString(input, "projectId") as Id<"projects">);
      return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(project, args.organizationId, "Project"), "Project"));
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
      return presentWorkspaceRecord(assertActiveWorkspaceRecord(event, args.organizationId, "Calendar event"));
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
        return mcpPublicWorkspacePage(page);
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
      return mcpPublicWorkspaceSearchResult(tasks, {
        search,
        limit,
        searchValues: taskSearchValues,
        sort: (a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0),
      });
    }

    if (args.tool === "tasks_get") {
      const task = await ctx.db.get(requiredString(input, "taskId") as Id<"clientTasks">);
      return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(task, args.organizationId, "Task"), "Task"));
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
      return mcpPublicMediaPage(page);
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
    const actorId = mcpActor(args.connectionId);

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
      return presentWorkspaceRecord((await ctx.db.get(id))!);
    }

    if (args.tool === "clients_update") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(clientId), args.organizationId, "Client");
      const revealed = await revealClientPii(existing);
      const client = clientInput({ ...existing, ...revealed, ...input });
      await ctx.db.patch(clientId, { ...client, ...await protectClientPii(args.organizationId, client), updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.update", clientId, `Updated client ${requiredString(input, "name") || existing.name}.`);
      return presentWorkspaceRecord((await ctx.db.get(clientId))!);
    }

    if (args.tool === "clients_delete") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(clientId), args.organizationId, "Client");
      await ctx.db.patch(clientId, { deletedAt: now, isDeleted: true, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.delete", clientId, `Deleted client ${existing.name}.`);
      return { removed: true };
    }

    if (args.tool === "clients_link_unit") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const propertyId = requiredString(input, "propertyId") as Id<"propertyUnits">;
      assertActiveWorkspaceRecord(await ctx.db.get(clientId), args.organizationId, "Client");
      assertActiveWorkspaceRecord(await ctx.db.get(propertyId), args.organizationId, "Property unit");
      const existing = await ctx.db
        .query("clientUnitLinks")
        .withIndex("by_client_property", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId).eq("propertyId", propertyId))
        .first();
      const status = clientUnitStatus(input);
      if (existing && !existing.deletedAt) {
        await ctx.db.patch(existing._id, { status, notes: optionalString(input, "notes"), updatedAt: now });
        await audit(ctx, args.organizationId, args.connectionId, "client.unit.link", clientId, "Updated a client apartment link.");
        return presentWorkspaceRecord((await ctx.db.get(existing._id))!);
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
      return presentWorkspaceRecord((await ctx.db.get(id))!);
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
        reference: workspaceReference("UNT", now),
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "property.create", id, `Created apartment ${requiredString(input, "title")}.`);
      return presentWorkspaceRecord((await ctx.db.get(id))!);
    }

    if (args.tool === "properties_update" || args.tool === "properties_update_field") {
      const propertyId = requiredString(input, "propertyId") as Id<"propertyUnits">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(propertyId), args.organizationId, "Property unit");
      const patch = args.tool === "properties_update_field"
        ? propertyFieldPatch(input)
        : propertyInput({ ...existing, ...input });
      if (args.tool === "properties_update") {
        await assertOptionalProject(ctx, args.organizationId, optionalString({ ...existing, ...input }, "projectId"));
      }
      await ctx.db.patch(propertyId, { ...patch, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "property.update", propertyId, `Updated apartment ${existing.title}.`);
      return presentWorkspaceRecord((await ctx.db.get(propertyId))!);
    }

    if (args.tool === "properties_delete") {
      const propertyId = requiredString(input, "propertyId") as Id<"propertyUnits">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(propertyId), args.organizationId, "Property unit");
      await ctx.db.patch(propertyId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "property.delete", propertyId, `Deleted apartment ${existing.title}.`);
      return { removed: true };
    }

    if (args.tool === "projects_create") {
      const id = await ctx.db.insert("projects", {
        organizationId: args.organizationId,
        ...projectInput(input),
        reference: workspaceReference("PRJ", now),
        syncState: projectStatus(input) === "approved" ? "synced" : "draft",
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "project.create", id, `Created project ${requiredString(input, "name")}.`);
      return presentWorkspaceRecord((await ctx.db.get(id))!);
    }

    if (args.tool === "projects_update") {
      const projectId = requiredString(input, "projectId") as Id<"projects">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(projectId), args.organizationId, "Project");
      const patch = projectInput({ ...existing, ...input });
      await ctx.db.patch(projectId, { ...patch, syncState: patch.status === "approved" ? "synced" : "draft", updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "project.update", projectId, `Updated project ${existing.name}.`);
      return presentWorkspaceRecord((await ctx.db.get(projectId))!);
    }

    if (args.tool === "projects_delete") {
      const projectId = requiredString(input, "projectId") as Id<"projects">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(projectId), args.organizationId, "Project");
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
      return presentWorkspaceRecord((await ctx.db.get(id))!);
    }

    if (args.tool === "calendar_update") {
      const eventId = requiredString(input, "eventId") as Id<"calendarEvents">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(eventId), args.organizationId, "Calendar event");
      const patch = calendarInput({ ...existing, ...input });
      await assertCalendarLinks(ctx, args.organizationId, patch);
      await ctx.db.patch(eventId, { ...patch, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "calendar.update", eventId, `Updated ${existing.title}.`);
      return presentWorkspaceRecord((await ctx.db.get(eventId))!);
    }

    if (args.tool === "calendar_delete") {
      const eventId = requiredString(input, "eventId") as Id<"calendarEvents">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(eventId), args.organizationId, "Calendar event");
      await ctx.db.patch(eventId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "calendar.delete", eventId, `Deleted ${existing.title}.`);
      return { removed: true };
    }

    if (args.tool === "tasks_create") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      assertActiveWorkspaceRecord(await ctx.db.get(clientId), args.organizationId, "Client");
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
      return presentWorkspaceRecord((await ctx.db.get(id))!);
    }

    if (args.tool === "tasks_update" || args.tool === "tasks_complete") {
      const taskId = requiredString(input, "taskId") as Id<"clientTasks">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
      const patch = args.tool === "tasks_complete"
        ? { status: "done" as const, completedAt: existing.completedAt ?? now }
        : taskInput({ ...existing, ...input });
      if (args.tool === "tasks_update") {
        await assertTaskLinks(ctx, args.organizationId, patch);
      }
      await ctx.db.patch(taskId, { ...patch, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Updated task ${existing.title}.`);
      return presentWorkspaceRecord((await ctx.db.get(taskId))!);
    }

    if (args.tool === "tasks_delete") {
      const taskId = requiredString(input, "taskId") as Id<"clientTasks">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
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
  return mcpCalendarEventPage(page);
}
