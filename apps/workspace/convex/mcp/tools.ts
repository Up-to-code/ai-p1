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
  assertDealLinks,
  assertMediaResource,
  assertProjectLinks,
  assertTaskLinks,
  calendarInput,
  clientInput,
  dealInput,
  inputObject,
  listCursor,
  listLimit,
  mediaKind,
  optionalNumber,
  optionalString,
  projectInput,
  requiredNumber,
  requiredString,
  searchTerm,
  taskInput,
  taskStatus,
  taskUpdateInput,
  type Input,
} from "./toolInputs";
import { markdownToHtml } from "./markdownToHtml";

export const mcpToolPermissionMap = toolPermissions;
export const mcpReadToolNames = readTools;

const TOOL_SCAN_LIMIT = 200;

const clientSearchValues = (client: { name: string; email?: string; phone?: string; company?: string; source: string }) => [
  client.name,
  client.email ?? "",
  client.phone ?? "",
  client.company ?? "",
  client.source,
];

const projectSearchValues = (project: { name: string; description?: string; status: string; health: string }) => [
  project.name,
  project.description ?? "",
  project.status,
  project.health,
];

const taskSearchValues = (task: { title: string; description?: string }) => [
  task.title,
  task.description ?? "",
];

const dealSearchValues = (deal: { title: string; source?: string; nextStep?: string; dealThinking?: string; tags?: string[] }) => [
  deal.title,
  deal.source ?? "",
  deal.nextStep ?? "",
  deal.dealThinking ?? "",
  ...(deal.tags ?? []),
];

function hasInputKey(input: Input, key: string) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function scopedProjectId(input: Input) {
  if (!hasInputKey(input, "projectId")) return undefined;
  return optionalString(input, "projectId");
}

function scopedClientId(input: Input) {
  if (!hasInputKey(input, "clientId")) return undefined;
  return optionalString(input, "clientId");
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
  resourceType: "project" | "client" | "calendarEvent" | "task",
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
      return listEvents(ctx, args.organizationId, start, end, listLimit(input), listCursor(input), optionalString(input, "spaceId"));
    }

    if (args.tool === "calendar_list_range") {
      return listEvents(ctx, args.organizationId, requiredNumber(input, "startAt"), requiredNumber(input, "endAt"), listLimit(input), listCursor(input), optionalString(input, "spaceId"));
    }

    if (args.tool === "calendar_list_month") {
      const year = requiredNumber(input, "year");
      const month = requiredNumber(input, "month");
      const start = Date.UTC(year, month - 1, 1);
      const end = Date.UTC(year, month, 1);
      return listEvents(ctx, args.organizationId, start, end, listLimit(input), listCursor(input), optionalString(input, "spaceId"));
    }

    if (args.tool === "calendar_get") {
      const event = await ctx.db.get(requiredString(input, "eventId") as Id<"calendarEvents">);
      return presentWorkspaceRecord(assertActiveWorkspaceRecord(event, args.organizationId, "Calendar event"));
    }

    if (args.tool === "tasks_list") {
      const limit = listLimit(input);
      const search = searchTerm(input);
      const projectId = scopedProjectId(input);
      const clientId = scopedClientId(input);
      const spaceId = optionalString(input, "spaceId");
      if (!search) {
        const query = spaceId && projectId
          ? ctx.db
              .query("tasks")
              .withIndex("by_organization_project_space", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId).eq("spaceId", spaceId))
          : hasInputKey(input, "projectId")
            ? ctx.db
                .query("tasks")
                .withIndex("by_organization_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId))
            : clientId
              ? ctx.db
                  .query("tasks")
                  .withIndex("by_organization_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId))
              : ctx.db
                  .query("tasks")
                  .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId));
        const page = await query.order("desc").paginate({ numItems: limit, cursor: listCursor(input) });
        return mcpPublicWorkspacePage(page);
      }
      const tasks = spaceId && projectId
        ? await ctx.db
            .query("tasks")
            .withIndex("by_organization_project_space", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId).eq("spaceId", spaceId))
            .take(TOOL_SCAN_LIMIT)
        : hasInputKey(input, "projectId")
          ? await ctx.db
              .query("tasks")
              .withIndex("by_organization_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId))
              .take(TOOL_SCAN_LIMIT)
          : clientId
            ? await ctx.db
                .query("tasks")
                .withIndex("by_organization_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId))
                .take(TOOL_SCAN_LIMIT)
            : await ctx.db
                .query("tasks")
                .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
                .take(TOOL_SCAN_LIMIT);
      return mcpPublicWorkspaceSearchResult(tasks, {
        search,
        limit,
        searchValues: taskSearchValues,
        sort: (a, b) => Date.parse(a.dueDate ?? "") - Date.parse(b.dueDate ?? ""),
      });
    }

    if (args.tool === "tasks_get") {
      const task = await ctx.db.get(requiredString(input, "taskId") as Id<"tasks">);
      return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(task, args.organizationId, "Task"), "Task"));
    }

    if (args.tool === "deals_list") {
      const limit = listLimit(input);
      const search = searchTerm(input);
      const projectId = scopedProjectId(input) as Id<"projects"> | undefined;
      const clientId = scopedClientId(input) as Id<"clients"> | undefined;
      const stage = optionalString(input, "stage") as "lead" | "qualified" | "proposal_sent" | "contract_sent" | "won" | "lost" | undefined;
      const status = optionalString(input, "status") as "open" | "won" | "lost" | "paused" | undefined;
      const query = hasInputKey(input, "projectId")
        ? ctx.db
            .query("deals")
            .withIndex("by_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId))
        : clientId
          ? ctx.db
              .query("deals")
              .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId))
          : stage
            ? ctx.db
                .query("deals")
                .withIndex("by_organization_stage", (q) => q.eq("organizationId", args.organizationId).eq("stage", stage))
            : status
              ? ctx.db
                  .query("deals")
                  .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", status))
              : ctx.db
                  .query("deals")
                  .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId));
      const page = await query.paginate({ numItems: limit, cursor: listCursor(input) });
      return {
        items: page.page
          .filter((deal) => !deal.deletedAt)
          .filter((deal) => !stage || deal.stage === stage)
          .filter((deal) => !status || deal.status === status)
          .filter((deal) => !search || dealSearchValues(deal).some((value) => value.toLowerCase().includes(search)))
          .map(presentWorkspaceRecord),
        isDone: page.isDone,
        continueCursor: page.continueCursor,
      };
    }

    if (args.tool === "deals_get") {
      const deal = await ctx.db.get(requiredString(input, "dealId") as Id<"deals">);
      return presentWorkspaceRecord(assertActiveWorkspaceRecord(deal, args.organizationId, "Deal"));
    }

    if (args.tool === "media_list") {
      const limit = listLimit(input);
      const resourceType = requiredString(input, "resourceType") as "project" | "client" | "calendarEvent" | "task";
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
        visibility: "workspace",
        ownerUserId: actorId,
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
      await audit(ctx, args.organizationId, args.connectionId, "client.update", clientId, `Updated client ${optionalString(input, "name") ?? existing.name}.`);
      return presentWorkspaceRecord((await ctx.db.get(clientId))!);
    }

    if (args.tool === "clients_delete") {
      const clientId = requiredString(input, "clientId") as Id<"clients">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(clientId), args.organizationId, "Client");
      await ctx.db.patch(clientId, { deletedAt: now, isDeleted: true, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.delete", clientId, `Deleted client ${existing.name}.`);
      return { removed: true };
    }

    if (args.tool === "projects_create") {
      const project = projectInput(input);
      await assertProjectLinks(ctx, args.organizationId, project);
      const id = await ctx.db.insert("projects", {
        organizationId: args.organizationId,
        ...project,
        visibility: "workspace",
        ownerUserId: actorId,
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
      await assertProjectLinks(ctx, args.organizationId, patch);
      await ctx.db.patch(projectId, { ...patch, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "project.update", projectId, `Updated project ${existing.name}.`);
      return presentWorkspaceRecord((await ctx.db.get(projectId))!);
    }

    if (args.tool === "projects_delete") {
      const projectId = requiredString(input, "projectId") as Id<"projects">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(projectId), args.organizationId, "Project");
      await ctx.db.patch(projectId, { deletedAt: now, isDeleted: true, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "project.delete", projectId, `Deleted project ${existing.name}.`);
      return { removed: true };
    }

    if (args.tool === "deals_create") {
      const deal = dealInput(input);
      await assertDealLinks(ctx, args.organizationId, deal);
      const id = await ctx.db.insert("deals", {
        organizationId: args.organizationId,
        ...deal,
        ownerUserId: deal.ownerUserId ?? actorId,
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
        ...(deal.status === "won" || deal.status === "lost" ? { closedAt: now } : {}),
      });
      await audit(ctx, args.organizationId, args.connectionId, "deal.create", id, `Created deal ${requiredString(input, "title")}.`);
      return presentWorkspaceRecord((await ctx.db.get(id))!);
    }

    if (args.tool === "deals_update") {
      const dealId = requiredString(input, "dealId") as Id<"deals">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(dealId), args.organizationId, "Deal");
      const patch = dealInput({ ...existing, ...input });
      await assertDealLinks(ctx, args.organizationId, patch);
      await ctx.db.patch(dealId, {
        ...patch,
        ownerUserId: patch.ownerUserId ?? existing.ownerUserId,
        updatedAt: now,
        ...(patch.status === "won" || patch.status === "lost" ? { closedAt: existing.closedAt ?? now } : {}),
      });
      await audit(ctx, args.organizationId, args.connectionId, "deal.update", dealId, `Updated deal ${existing.title}.`);
      return presentWorkspaceRecord((await ctx.db.get(dealId))!);
    }

    if (args.tool === "deals_delete") {
      const dealId = requiredString(input, "dealId") as Id<"deals">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(dealId), args.organizationId, "Deal");
      await ctx.db.patch(dealId, { deletedAt: now, isDeleted: true, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "deal.delete", dealId, `Deleted deal ${existing.title}.`);
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
      const taskData = taskInput(input);
      await assertTaskLinks(ctx, args.organizationId, taskData);
      const id = await ctx.db.insert("tasks", {
        organizationId: args.organizationId,
        ...taskData,
        description: taskData.description ? markdownToHtml(taskData.description) : undefined,
        visibility: "workspace",
        createdByUserId: actorId,
        createdAt: now,
        updatedAt: now,
        ...(taskStatus(input) === "done" ? { completedAt: now } : {}),
      });
      await audit(ctx, args.organizationId, args.connectionId, "client.task.create", id, `Created task ${requiredString(input, "title")}.`);
      return presentWorkspaceRecord((await ctx.db.get(id))!);
    }

    if (args.tool === "tasks_update" || args.tool === "tasks_complete") {
      const taskId = requiredString(input, "taskId") as Id<"tasks">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
      
      if (args.tool === "tasks_complete") {
        if (existing.status === "done") {
          return presentWorkspaceRecord(existing);
        }
        const patch = { status: "done" as const, completedAt: existing.completedAt ?? now };
        await ctx.db.patch(taskId, { ...patch, updatedAt: now });
        await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Completed task ${existing.title}.`);
        return presentWorkspaceRecord((await ctx.db.get(taskId))!);
      }
      
      const patch = taskUpdateInput(input, existing);
      await assertTaskLinks(ctx, args.organizationId, patch);
      await ctx.db.patch(taskId, {
        ...patch,
        description: patch.description ? markdownToHtml(patch.description) : patch.description,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Updated task ${existing.title}.`);
      return presentWorkspaceRecord((await ctx.db.get(taskId))!);
    }

    if (args.tool === "tasks_delete") {
      const taskId = requiredString(input, "taskId") as Id<"tasks">;
      const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
      await ctx.db.patch(taskId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.connectionId, "client.task.delete", taskId, `Deleted task ${existing.title}.`);
      return { removed: true };
    }

    if (args.tool === "media_attach_url") {
      await assertMediaResource(ctx, args.organizationId, input);
      const resourceType = requiredString(input, "resourceType") as "project" | "client" | "calendarEvent" | "task";
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

    if (args.tool === "notifications_schedule") {
      const id = await ctx.db.insert("notificationSchedules", {
        organizationId: args.organizationId,
        ownerUserId: actorId,
        title: requiredString(input, "title"),
        body: requiredString(input, "body"),
        category: (optionalString(input, "category") as "calendar" | "task" | "manual" | "organization") ?? "manual",
        scheduledAt: requiredNumber(input, "scheduledAt"),
        timezone: optionalString(input, "timezone"),
        recurrence: input.recurrence as { frequency: "daily" | "weekly" | "monthly"; interval: number; untilAt?: number } | undefined,
        status: "active",
        createdByUserId: actorId,
        updatedByUserId: actorId,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "notification.schedule", id, `Scheduled notification: ${requiredString(input, "title")}.`);
      return (await ctx.db.get(id))!;
    }

    if (args.tool === "notifications_update_schedule") {
      const scheduleId = requiredString(input, "scheduleId") as Id<"notificationSchedules">;
      const existing = await ctx.db.get(scheduleId);
      if (!existing || existing.organizationId !== args.organizationId) {
        throw new Error("Notification schedule was not found.");
      }
      await ctx.db.patch(scheduleId, {
        title: optionalString(input, "title") ?? existing.title,
        body: optionalString(input, "body") ?? existing.body,
        category: (optionalString(input, "category") as "calendar" | "task" | "manual" | "organization") ?? existing.category,
        scheduledAt: optionalNumber(input, "scheduledAt") ?? existing.scheduledAt,
        timezone: optionalString(input, "timezone") ?? existing.timezone,
        recurrence: (input.recurrence as typeof existing.recurrence) ?? existing.recurrence,
        status: "active",
        updatedByUserId: actorId,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "notification.schedule.update", scheduleId, `Updated notification schedule.`);
      return (await ctx.db.get(scheduleId))!;
    }

    if (args.tool === "notifications_cancel_schedule") {
      const scheduleId = requiredString(input, "scheduleId") as Id<"notificationSchedules">;
      const existing = await ctx.db.get(scheduleId);
      if (!existing || existing.organizationId !== args.organizationId) {
        throw new Error("Notification schedule was not found.");
      }
      await ctx.db.patch(scheduleId, {
        status: "canceled",
        updatedByUserId: actorId,
        updatedAt: now,
        canceledAt: now,
      });
      await audit(ctx, args.organizationId, args.connectionId, "notification.schedule.cancel", scheduleId, `Canceled notification schedule.`);
      return { canceled: true };
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
  spaceId?: string | null,
) {
  let query = ctx.db
    .query("calendarEvents")
    .withIndex("by_start", (q) =>
      q.eq("organizationId", organizationId).gte("startAt", startAt).lt("startAt", endAt),
    );
  if (spaceId) {
    query = query.filter((q) => q.eq("spaceId", spaceId));
  }
  const page = await query.paginate({ numItems: limit, cursor });
  return mcpCalendarEventPage(page);
}
