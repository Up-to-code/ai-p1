import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { protectClientPii, revealClientPii } from "../security/clientPii";
import { clientInputValidator, clientValidator, resolveClientPipelineStage } from "./validators";

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function withoutPrivateClientFields(client: Doc<"clients">) {
  const safeClient = { ...client };
  delete safeClient.deletedAt;
  delete safeClient.isDeleted;
  delete safeClient.encryptedEmail;
  delete safeClient.encryptedPhone;
  delete safeClient.piiEncryptedAt;
  return safeClient;
}

async function presentClient(client: Doc<"clients">) {
  const safeClient = withoutPrivateClientFields(client);
  const pii = await revealClientPii(client);
  return {
    ...safeClient,
    ...pii,
    id: client._id,
    visibility: client.visibility ?? "private",
    phone: pii.phone ?? client.phone ?? "",
    contact: pii.email ?? client.email ?? client.phone ?? client.company ?? "",
    priority: "normal" as const,
    budget: "",
    assetInterest: client.notes ?? client.source,
    pipelineStage: resolveClientPipelineStage(client),
    pipelineOrder: client.pipelineOrder,
    added: isoDate(client.createdAt),
    lastContact: isoDate(client.updatedAt),
  };
}

async function assertClient(ctx: MutationCtx, organizationId: string, clientId: Id<"clients">) {
  const client = await ctx.db.get(clientId);
  if (!client || client.organizationId !== organizationId || client.deletedAt) {
    throw new Error("Client was not found.");
  }
  return client;
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "create");
    const now = Date.now();
    const id = await ctx.db.insert("clients", {
      organizationId: args.organizationId,
      ...args.input,
      ...await protectClientPii(args.organizationId, args.input),
      ownerUserId: args.input.ownerUserId ?? user._id,
      pipelineStage: args.input.pipelineStage ?? "new",
      source: args.input.source ?? "manual",
      visibility: args.input.visibility ?? "private",
      isDeleted: false,
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
    const presented = await presentClient(client);
    await enqueueClientWebhook(ctx, args.organizationId, "client.created", id, presented, now);
    return presented;
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await assertClient(ctx, args.organizationId, args.clientId);
    const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
    const now = Date.now();
    await ctx.db.patch(args.clientId, {
      ...args.input,
      ...await protectClientPii(args.organizationId, args.input),
      ownerUserId: args.input.ownerUserId ?? existing.ownerUserId,
      source: args.input.source ?? existing.source,
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
    const presented = await presentClient(client);
    await enqueueClientWebhook(ctx, args.organizationId, "client.updated", args.clientId, presented, now);
    return presented;
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "delete");
    const existing = await assertClient(ctx, args.organizationId, args.clientId);
    const now = Date.now();
    await ctx.db.patch(args.clientId, { deletedAt: now, isDeleted: true, updatedAt: now });
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
