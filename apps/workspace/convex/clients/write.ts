import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { authUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { protectClientPii } from "../security/clientPii";
import { presentClient } from "./read";
import { clientInputValidator, clientValidator } from "./validators";

type ClientInput = {
  name: string;
  type: "person" | "organization";
  ownerUserId?: string;
  status: "new" | "active" | "nurture" | "inactive" | "archived";
  pipelineStage?: string;
  pipelineOrder?: number;
  source?: string;
  contact?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  budget?: string;
  assetInterest?: string;
  added?: string;
  lastContact?: string;
  visibility?: "private" | "team" | "workspace";
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  tags?: string[];
};

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

async function createClientCore(ctx: MutationCtx, args: { organizationId: string; input: ClientInput; actorUserId: string }) {
  const now = Date.now();
  const id = await ctx.db.insert("clients", {
    organizationId: args.organizationId,
    ...args.input,
    ...(await protectClientPii(args.organizationId, { email: args.input.email, phone: args.input.phone })),
    ownerUserId: args.input.ownerUserId ?? args.actorUserId,
    pipelineStage: args.input.pipelineStage ?? "new",
    source: args.input.source ?? "manual",
    visibility: args.input.visibility ?? "private",
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  const client = await ctx.db.get(id);
  if (!client) throw new Error("Client could not be created.");
  const presented = await presentClient(client);
  await enqueueClientWebhook(ctx, args.organizationId, "client.created", id, presented, now);
  return { id, presented, now };
}

async function updateClientCore(ctx: MutationCtx, args: { organizationId: string; clientId: Id<"clients">; input: ClientInput; actorUserId: string }) {
  const existing = await ctx.db.get(args.clientId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
    throw new Error("Client was not found.");
  }
  const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
  const now = Date.now();
  await ctx.db.patch(args.clientId, {
    ...args.input,
    ...(await protectClientPii(args.organizationId, { email: args.input.email, phone: args.input.phone })),
    ownerUserId: args.input.ownerUserId ?? existing.ownerUserId,
    source: args.input.source ?? existing.source,
    visibility: nextVisibility,
    updatedAt: now,
  });

  const client = await ctx.db.get(args.clientId);
  if (!client) throw new Error("Client was not found.");
  const presented = await presentClient(client);
  await enqueueClientWebhook(ctx, args.organizationId, "client.updated", args.clientId, presented, now);
  return { presented, now };
}

async function deleteClientCore(ctx: MutationCtx, args: { organizationId: string; clientId: Id<"clients">; actorUserId: string }) {
  const existing = await ctx.db.get(args.clientId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
    throw new Error("Client was not found.");
  }
  const now = Date.now();
  await ctx.db.patch(args.clientId, { deletedAt: now, recordState: "deleted", updatedAt: now });
  await enqueueClientWebhook(ctx, args.organizationId, "client.deleted", args.clientId, { id: args.clientId, deletedAt: now }, now);
  return { removed: true as const, now, name: existing.name };
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: clientInputValidator,
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "create");
    const { id, presented, now } = await createClientCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.create",
      target: id,
      summary: `Created client ${args.input.name}.`,
      createdAt: now,
    });
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
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    await assertClient(ctx, args.organizationId, args.clientId);
    const { presented, now } = await updateClientCore(ctx, {
      organizationId: args.organizationId,
      clientId: args.clientId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.update",
      target: args.clientId,
      summary: `Updated client ${args.input.name}.`,
      createdAt: now,
    });
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
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "delete");
    const { now, name } = await deleteClientCore(ctx, {
      organizationId: args.organizationId,
      clientId: args.clientId,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.delete",
      target: args.clientId,
      summary: `Deleted client ${name}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});

export const createInternal = internalMutation({
  args: {
    organizationId: v.string(),
    input: clientInputValidator,
    actorUserId: v.string(),
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const { presented } = await createClientCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const updateInternal = internalMutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    input: clientInputValidator,
    actorUserId: v.string(),
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const { presented } = await updateClientCore(ctx, {
      organizationId: args.organizationId,
      clientId: args.clientId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const deleteInternal = internalMutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    actorUserId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    await deleteClientCore(ctx, {
      organizationId: args.organizationId,
      clientId: args.clientId,
      actorUserId: args.actorUserId,
    });
    return { removed: true };
  },
});
