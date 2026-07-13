import type { Infer } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { protectClientPii, protectClientPiiPatch } from "../security/clientPii";
import { presentClient } from "./presentation";
import { clientInputValidator, clientPatchValidator } from "./validators";

export type ClientInput = Infer<typeof clientInputValidator>;
export type ClientPatch = Infer<typeof clientPatchValidator>;

type ClientLifecycleContext = Pick<MutationCtx, "db" | "scheduler">;
type ClientIdentity = Readonly<{ organizationId: string; actorUserId: string }>;

async function requireActiveClient(
  ctx: ClientLifecycleContext,
  organizationId: string,
  clientId: Id<"clients">,
) {
  const client = await ctx.db.get(clientId);
  if (!client || client.organizationId !== organizationId || client.deletedAt) {
    throw new Error("Client was not found.");
  }
  return client;
}

async function appendAudit(
  ctx: ClientLifecycleContext,
  input: ClientIdentity & { action: string; target: string; summary: string; createdAt: number },
) {
  await ctx.db.insert("organizationAuditEvents", input);
}

async function enqueueWebhook(
  ctx: ClientLifecycleContext,
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

/** Canonical Client creation transaction used by every transport adapter. */
export async function createClient(
  ctx: ClientLifecycleContext,
  args: ClientIdentity & { input: ClientInput },
) {
  const now = Date.now();
  const id = await ctx.db.insert("clients", {
    organizationId: args.organizationId,
    ...args.input,
    ...(await protectClientPii(args.organizationId, {
      email: args.input.email,
      phone: args.input.phone,
    })),
    ownerUserId: args.input.ownerUserId ?? args.actorUserId,
    pipelineStage: args.input.pipelineStage ?? "new",
    source: args.input.source ?? "manual",
    visibility: args.input.visibility ?? "private",
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });
  const client = await requireActiveClient(ctx, args.organizationId, id);
  const presented = await presentClient(client);
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "client.create",
    target: id,
    summary: `Created client ${args.input.name}.`,
    createdAt: now,
  });
  await enqueueWebhook(ctx, args.organizationId, "client.created", id, presented, now);
  return presented;
}

/** Canonical Client patch transaction; omitted writable fields remain unchanged. */
export async function updateClient(
  ctx: ClientLifecycleContext,
  args: ClientIdentity & { clientId: Id<"clients">; input: ClientPatch },
) {
  if (Object.keys(args.input).length === 0) {
    throw new Error("At least one client field is required.");
  }
  const existing = await requireActiveClient(ctx, args.organizationId, args.clientId);
  const now = Date.now();
  await ctx.db.patch(args.clientId, {
    ...args.input,
    ...(await protectClientPiiPatch(args.organizationId, {
      ...(Object.hasOwn(args.input, "email") ? { email: args.input.email } : {}),
      ...(Object.hasOwn(args.input, "phone") ? { phone: args.input.phone } : {}),
    })),
    ownerUserId: args.input.ownerUserId ?? existing.ownerUserId,
    source: args.input.source ?? existing.source,
    visibility: args.input.visibility ?? existing.visibility ?? "private",
    updatedAt: now,
  });
  const client = await requireActiveClient(ctx, args.organizationId, args.clientId);
  const presented = await presentClient(client);
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "client.update",
    target: args.clientId,
    summary: `Updated client ${args.input.name ?? existing.name}.`,
    createdAt: now,
  });
  await enqueueWebhook(ctx, args.organizationId, "client.updated", args.clientId, presented, now);
  return presented;
}

/** Soft-delete a Client once; repeated and cross-tenant attempts fail closed. */
export async function deleteClient(
  ctx: ClientLifecycleContext,
  args: ClientIdentity & { clientId: Id<"clients"> },
) {
  const existing = await requireActiveClient(ctx, args.organizationId, args.clientId);
  const now = Date.now();
  await ctx.db.patch(args.clientId, {
    deletedAt: now,
    recordState: "deleted",
    updatedAt: now,
  });
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "client.delete",
    target: args.clientId,
    summary: `Deleted client ${existing.name}.`,
    createdAt: now,
  });
  await enqueueWebhook(ctx, args.organizationId, "client.deleted", args.clientId, {
    id: args.clientId,
    deletedAt: now,
  }, now);
  return { removed: true as const };
}
