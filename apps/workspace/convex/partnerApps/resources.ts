import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { partnerActionValidator, partnerResourceValidator } from "./validators";

type Input = Record<string, unknown>;

function objectInput(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Input
    : {};
}

function optionalString(input: Input, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalNumber(input: Input, key: string) {
  const value = input[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function requiredString(input: Input, key: string, fallback = "") {
  return optionalString(input, key) ?? fallback;
}

function present<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

function limitFromInput(input: Input) {
  const value = optionalNumber(input, "limit") ?? 25;
  return Math.max(1, Math.min(500, Math.floor(value)));
}

async function audit(
  ctx: MutationCtx,
  organizationId: string,
  partnerAppId: Id<"partnerApps">,
  action: string,
  target: string,
  summary: string,
) {
  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: `partner:${partnerAppId}`,
    actorType: "partnerApp",
    actorPartnerAppId: partnerAppId,
    action,
    target,
    summary,
    createdAt: Date.now(),
  });
}

async function enqueueOutbound(
  ctx: MutationCtx,
  organizationId: string,
  eventType: string,
  target: string,
  payload: unknown,
  timestamp: number,
) {
  await ctx.scheduler.runAfter(0, internal.partnerApps.webhooks.enqueueOutbound, {
    organizationId,
    eventId: `${eventType}:${target}:${timestamp}`,
    eventType,
    payload,
  });
}

function clientPatch(input: Input) {
  return {
    ...(optionalString(input, "name") ? { name: optionalString(input, "name")! } : {}),
    ...(optionalString(input, "type") ? { type: optionalString(input, "type") as "Buyer" | "Tenant" | "Investor" | "Broker" } : {}),
    ...(optionalString(input, "contact") ? { contact: optionalString(input, "contact")! } : {}),
    ...(optionalString(input, "phone") ? { phone: optionalString(input, "phone")! } : {}),
    ...(optionalNumber(input, "age") !== undefined ? { age: optionalNumber(input, "age")! } : {}),
    ...(optionalString(input, "nationality") ? { nationality: optionalString(input, "nationality")! } : {}),
    ...(optionalString(input, "generation") ? { generation: optionalString(input, "generation")! } : {}),
    ...(optionalString(input, "budget") ? { budget: optionalString(input, "budget")! } : {}),
    ...(optionalString(input, "propertyInterest") ? { propertyInterest: optionalString(input, "propertyInterest")! } : {}),
    ...(optionalString(input, "status") ? { status: optionalString(input, "status") as "active" | "inactive" } : {}),
    ...(optionalString(input, "pipelineStage") ? { pipelineStage: optionalString(input, "pipelineStage") as "new" | "qualified" | "viewing" | "negotiation" | "closed" } : {}),
    ...(optionalNumber(input, "pipelineOrder") !== undefined ? { pipelineOrder: optionalNumber(input, "pipelineOrder")! } : {}),
    ...(optionalString(input, "priority") ? { priority: optionalString(input, "priority") as "normal" | "high" | "urgent" } : {}),
    ...(optionalString(input, "nextAction") ? { nextAction: optionalString(input, "nextAction")! } : {}),
    ...(optionalString(input, "issue") ? { issue: optionalString(input, "issue")! } : {}),
  };
}

async function listTable(
  ctx: QueryCtx,
  organizationId: string,
  table:
    | "clients"
    | "propertyUnits"
    | "projects"
    | "clientTasks"
    | "calendarEvents",
  input: Input,
) {
  const rows = await ctx.db
    .query(table)
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(limitFromInput(input));

  return rows.filter((row: { deletedAt?: number }) => !row.deletedAt).map(present);
}

export const read = query({
  args: {
    organizationId: v.string(),
    resource: partnerResourceValidator,
    action: partnerActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    if (args.action !== "read") throw new Error("Read endpoint requires read action.");
    const input = objectInput(args.input);

    if (args.resource === "organization") {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .unique();
      return organization ? present(organization) : null;
    }

    if (args.resource === "client") {
      const clientId = optionalString(input, "clientId");
      if (clientId) {
        const client = await ctx.db.get(clientId as Id<"clients">);
        if (!client || client.organizationId !== args.organizationId || client.deletedAt) return null;
        return present(client);
      }
      return listTable(ctx, args.organizationId, "clients", input);
    }

    if (args.resource === "property") {
      const propertyId = optionalString(input, "propertyId");
      if (propertyId) {
        const property = await ctx.db.get(propertyId as Id<"propertyUnits">);
        if (!property || property.organizationId !== args.organizationId || property.deletedAt) return null;
        return present(property);
      }
      return listTable(ctx, args.organizationId, "propertyUnits", input);
    }

    if (args.resource === "project") {
      const projectId = optionalString(input, "projectId");
      if (projectId) {
        const project = await ctx.db.get(projectId as Id<"projects">);
        if (!project || project.organizationId !== args.organizationId || project.deletedAt) return null;
        return present(project);
      }
      return listTable(ctx, args.organizationId, "projects", input);
    }

    if (args.resource === "task") {
      const taskId = optionalString(input, "taskId");
      if (taskId) {
        const task = await ctx.db.get(taskId as Id<"clientTasks">);
        if (!task || task.organizationId !== args.organizationId || task.deletedAt) return null;
        return present(task);
      }
      return listTable(ctx, args.organizationId, "clientTasks", input);
    }

    if (args.resource === "calendar") {
      const eventId = optionalString(input, "eventId");
      if (eventId) {
        const event = await ctx.db.get(eventId as Id<"calendarEvents">);
        if (!event || event.organizationId !== args.organizationId || event.deletedAt) return null;
        return present(event);
      }
      return listTable(ctx, args.organizationId, "calendarEvents", input);
    }

    if (args.resource === "media") {
      const resourceType = optionalString(input, "resourceType");
      const resourceId = optionalString(input, "resourceId");
      if (!resourceType || !resourceId) return [];
      const rows = await ctx.db
        .query("mediaAssets")
        .withIndex("by_organization_resource", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("resourceType", resourceType as "project" | "property" | "client" | "calendarEvent" | "task")
            .eq("resourceId", resourceId),
        )
        .take(limitFromInput(input));
      return rows.map(present);
    }

    return null;
  },
});

export const write = mutation({
  args: {
    organizationId: v.string(),
    partnerAppId: v.id("partnerApps"),
    resource: partnerResourceValidator,
    action: partnerActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const input = objectInput(args.input);
    const now = Date.now();

    if (args.resource !== "client") {
      throw new Error("Partner writes currently support clients only.");
    }

    if (args.action === "create") {
      const id = await ctx.db.insert("clients", {
        organizationId: args.organizationId,
        name: requiredString(input, "name", "Partner client"),
        type: (optionalString(input, "type") ?? "Buyer") as "Buyer" | "Tenant" | "Investor" | "Broker",
        contact: requiredString(input, "contact", optionalString(input, "name") ?? "Partner client"),
        phone: requiredString(input, "phone", ""),
        age: optionalNumber(input, "age") ?? 0,
        nationality: requiredString(input, "nationality", ""),
        generation: requiredString(input, "generation", ""),
        budget: requiredString(input, "budget", ""),
        propertyInterest: requiredString(input, "propertyInterest", ""),
        status: (optionalString(input, "status") ?? "active") as "active" | "inactive",
        visibility: "private",
        pipelineStage: (optionalString(input, "pipelineStage") ?? "new") as "new" | "qualified" | "viewing" | "negotiation" | "closed",
        ...(optionalNumber(input, "pipelineOrder") !== undefined ? { pipelineOrder: optionalNumber(input, "pipelineOrder")! } : {}),
        priority: (optionalString(input, "priority") ?? "normal") as "normal" | "high" | "urgent",
        nextAction: requiredString(input, "nextAction", ""),
        issue: optionalString(input, "issue"),
        createdByUserId: `partner:${args.partnerAppId}`,
        createdAt: now,
        updatedAt: now,
      });
      await audit(ctx, args.organizationId, args.partnerAppId, "partner.client.create", id, "Created client from partner API.");
      const client = present((await ctx.db.get(id))!);
      await enqueueOutbound(ctx, args.organizationId, "client.created", id, client, now);
      return client;
    }

    const clientId = requiredString(input, "clientId") as Id<"clients">;
    const existing = await ctx.db.get(clientId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Client was not found.");
    }

    if (args.action === "update") {
      await ctx.db.patch(clientId, { ...clientPatch(input), updatedAt: now });
      await audit(ctx, args.organizationId, args.partnerAppId, "partner.client.update", clientId, "Updated client from partner API.");
      const client = present((await ctx.db.get(clientId))!);
      await enqueueOutbound(ctx, args.organizationId, "client.updated", clientId, client, now);
      return client;
    }

    if (args.action === "delete") {
      await ctx.db.patch(clientId, { deletedAt: now, updatedAt: now });
      await audit(ctx, args.organizationId, args.partnerAppId, "partner.client.delete", clientId, "Deleted client from partner API.");
      await enqueueOutbound(ctx, args.organizationId, "client.deleted", clientId, {
        id: clientId,
        deletedAt: now,
      }, now);
      return { deleted: true };
    }

    throw new Error("Unsupported partner write action.");
  },
});
