import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { assertPlatformAdmin } from "../platform/access";
import { clientInputValidator, clientUnitLinkInputValidator, clientUnitLinkValidator, clientValidator } from "./validators";

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function presentClient(client: Doc<"clients">) {
  return {
    ...client,
    id: client._id,
    visibility: client.visibility ?? "private",
    nextActionDate: "This week",
    appointmentTime: "10:00",
    added: isoDate(client.createdAt),
    lastContact: isoDate(client.updatedAt),
    syncState: client.issue ? ("blocked" as const) : ("draft" as const),
  };
}

function presentLink(link: Doc<"clientUnitLinks">) {
  return { ...link, id: link._id };
}

async function assertClient(ctx: MutationCtx, organizationId: string, clientId: Id<"clients">) {
  const client = await ctx.db.get(clientId);
  if (!client || client.organizationId !== organizationId || client.deletedAt) {
    throw new Error("Client was not found.");
  }
  return client;
}

async function assertUnit(ctx: MutationCtx, organizationId: string, propertyId: Id<"propertyUnits">) {
  const property = await ctx.db.get(propertyId);
  if (!property || property.organizationId !== organizationId || property.deletedAt) {
    throw new Error("Property unit was not found.");
  }
  return property;
}

async function enqueueClientWebhook(
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

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: clientInputValidator,
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "create");
    if ((args.input.visibility ?? "private") === "public") {
      await assertPlatformAdmin(ctx);
    }
    const now = Date.now();
    const id = await ctx.db.insert("clients", {
      organizationId: args.organizationId,
      ...args.input,
      visibility: args.input.visibility ?? "private",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.create",
      target: id,
      summary: `Created client ${args.input.name}.`,
      createdAt: now,
    });

    const client = await ctx.db.get(id);
    if (!client) throw new Error("Client could not be created.");
    await enqueueClientWebhook(ctx, args.organizationId, "client.created", id, presentClient(client), now);
    return presentClient(client);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    input: clientInputValidator,
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await assertClient(ctx, args.organizationId, args.clientId);
    const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
    if (nextVisibility !== (existing.visibility ?? "private")) {
      await assertPlatformAdmin(ctx);
    }
    const now = Date.now();
    await ctx.db.patch(args.clientId, {
      ...args.input,
      visibility: nextVisibility,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.update",
      target: args.clientId,
      summary: `Updated client ${args.input.name}.`,
      createdAt: now,
    });

    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Client was not found.");
    await enqueueClientWebhook(ctx, args.organizationId, "client.updated", args.clientId, presentClient(client), now);
    return presentClient(client);
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "delete");
    const existing = await assertClient(ctx, args.organizationId, args.clientId);
    const now = Date.now();
    await ctx.db.patch(args.clientId, { deletedAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.delete",
      target: args.clientId,
      summary: `Deleted client ${existing.name}.`,
      createdAt: now,
    });

    await enqueueClientWebhook(ctx, args.organizationId, "client.deleted", args.clientId, {
      id: args.clientId,
      deletedAt: now,
    }, now);
    return { removed: true };
  },
});

export const linkUnitFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: clientUnitLinkInputValidator,
  },
  returns: clientUnitLinkValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    await assertClient(ctx, args.organizationId, args.input.clientId);
    const property = await assertUnit(ctx, args.organizationId, args.input.propertyId);
    const now = Date.now();
    const existing = await ctx.db
      .query("clientUnitLinks")
      .withIndex("by_client_property", (q) =>
        q.eq("organizationId", args.organizationId).eq("clientId", args.input.clientId).eq("propertyId", args.input.propertyId),
      )
      .first();

    if (existing && !existing.deletedAt) {
      await ctx.db.patch(existing._id, {
        status: args.input.status,
        notes: args.input.notes,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      if (!updated) throw new Error("Client unit link was not found.");
      return presentLink(updated);
    }

    const id = await ctx.db.insert("clientUnitLinks", {
      organizationId: args.organizationId,
      ...args.input,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.unit.link",
      target: args.input.clientId,
      summary: `Linked ${property.title} to a client.`,
      createdAt: now,
    });

    const link = await ctx.db.get(id);
    if (!link) throw new Error("Client unit link could not be created.");
    return presentLink(link);
  },
});

export const unlinkUnitFromHono = mutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    propertyId: v.id("propertyUnits"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    await assertClient(ctx, args.organizationId, args.clientId);
    await assertUnit(ctx, args.organizationId, args.propertyId);
    const existing = await ctx.db
      .query("clientUnitLinks")
      .withIndex("by_client_property", (q) =>
        q.eq("organizationId", args.organizationId).eq("clientId", args.clientId).eq("propertyId", args.propertyId),
      )
      .first();
    if (!existing || existing.deletedAt) return { removed: true };

    const now = Date.now();
    await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.unit.unlink",
      target: args.clientId,
      summary: "Unlinked a unit from a client.",
      createdAt: now,
    });

    return { removed: true };
  },
});
