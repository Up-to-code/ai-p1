import { api } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { encryptedPlaceholder, protectOrganizationJson } from "../security/organizationData";
import { protectClientPii, revealClientPii } from "../security/clientPii";

const RETRY_DELAYS_MS = [
  0,
  60 * 1000,
  5 * 60 * 1000,
  30 * 60 * 1000,
  2 * 60 * 60 * 1000,
  12 * 60 * 60 * 1000,
];

type Input = Record<string, unknown>;

export function objectInput(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Input
    : {};
}

export function optionalString(input: Input, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function optionalNumber(input: Input, key: string) {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function clientFields(input: Input) {
  return {
    name: optionalString(input, "name") ?? "Partner client",
    type: (optionalString(input, "type") ?? "person") as "person" | "organization",
    email: optionalString(input, "email") ?? optionalString(input, "contact"),
    phone: optionalString(input, "phone"),
    company: optionalString(input, "company"),
    contactName: optionalString(input, "contactName"),
    website: optionalString(input, "website"),
    notes: optionalString(input, "notes"),
    source: optionalString(input, "source") ?? "partner",
    ownerUserId: optionalString(input, "ownerUserId") ?? "partner",
    status: (optionalString(input, "status") ?? "new") as "new" | "active" | "nurture" | "inactive" | "archived",
    visibility: "private" as const,
  };
}

export function presentEndpoint(endpoint: Doc<"partnerWebhookEndpoints">) {
  const safeEndpoint: Partial<Doc<"partnerWebhookEndpoints">> = { ...endpoint };
  delete safeEndpoint.signingSecret;
  return { ...safeEndpoint, id: endpoint._id };
}

export async function findDuplicateInboundEvent(
  ctx: QueryCtx,
  args: { partnerAppId: string; eventId: string; idempotencyKey?: string },
) {
  const byEventId = await ctx.db
    .query("partnerInboundEvents")
    .withIndex("by_partner_event", (q) =>
      q.eq("partnerAppId", args.partnerAppId).eq("eventId", args.eventId),
    )
    .unique();
  if (byEventId) return byEventId;

  if (!args.idempotencyKey) return null;
  return await ctx.db
    .query("partnerInboundEvents")
    .withIndex("by_partner_idempotency", (q) =>
      q.eq("partnerAppId", args.partnerAppId).eq("idempotencyKey", args.idempotencyKey!),
    )
    .unique();
}

export async function insertInboundEvent(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    partnerAppId: string;
    input: {
      eventId: string;
      idempotencyKey?: string;
      eventType: string;
      occurredAt: number;
      data: unknown;
    };
  },
) {
  const now = Date.now();
  return await ctx.db.insert("partnerInboundEvents", {
    organizationId: args.organizationId,
    partnerAppId: args.partnerAppId,
    eventId: args.input.eventId,
    idempotencyKey: args.input.idempotencyKey,
    eventType: args.input.eventType,
    occurredAt: args.input.occurredAt,
    payload: encryptedPlaceholder(),
    encryptedPayload: await protectOrganizationJson(args.organizationId, "partner-inbound-event", args.input.data),
    payloadRedacted: true,
    status: "accepted",
    expiresAt: now + 90 * 24 * 60 * 60 * 1000,
    createdAt: now,
  });
}

export async function applyInboundClientUpsert(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    partnerAppId: string;
    eventType: string;
    data: unknown;
  },
) {
  if (args.eventType !== "client.upsert") return;

  const now = Date.now();
  const data = objectInput(args.data);
  const externalId = optionalString(data, "externalId");
  const client = objectInput(data.client ?? data);
  if (!externalId) return;

  const existingRef = await ctx.db
    .query("partnerExternalRefs")
    .withIndex("by_partner_resource_external", (q) =>
      q
        .eq("partnerAppId", args.partnerAppId)
        .eq("resourceType", "client")
        .eq("externalId", externalId),
    )
    .unique();

  if (existingRef) {
    const clientId = existingRef.resourceId as Id<"clients">;
    const existingClient = await ctx.db.get(clientId);
    if (existingClient?.organizationId === args.organizationId && !existingClient.deletedAt) {
      const revealed = await revealClientPii(existingClient);
      const fields = clientFields({ ...existingClient, ...revealed, ...client });
      await ctx.db.patch(clientId, {
        ...fields,
        ...await protectClientPii(args.organizationId, fields),
        updatedAt: now,
      });
    }
  } else {
    const fields = clientFields(client);
    const clientId = await ctx.db.insert("clients", {
      organizationId: args.organizationId,
      ...fields,
      ...await protectClientPii(args.organizationId, fields),
      isDeleted: false,
      createdByUserId: `partner:${args.partnerAppId}`,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("partnerExternalRefs", {
      organizationId: args.organizationId,
      partnerAppId: args.partnerAppId,
      resourceType: "client",
      externalId,
      resourceId: clientId,
      createdAt: now,
      updatedAt: now,
    });
  }

  await ctx.db.insert("organizationAuditEvents", {
    organizationId: args.organizationId,
    actorUserId: `partner:${args.partnerAppId}`,
    actorType: "partnerApp",
    actorPartnerAppId: args.partnerAppId,
    action: "partner.webhook.client.upsert",
    target: externalId,
    summary: "Accepted partner client upsert webhook.",
    createdAt: now,
  });
}

export async function enqueueWebhookDeliveries(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    eventId: string;
    eventType: string;
    payload: unknown;
  },
) {
  const connections = await ctx.db
    .query("organizationPartnerConnections")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
    .take(200);
  const activePartnerAppIds = new Set(
    connections
      .filter((connection) => connection.status === "active")
      .map((connection) => connection.partnersAppId),
  );
  const endpoints = await ctx.db
    .query("partnerWebhookEndpoints")
    .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
    .take(200);

  const now = Date.now();
  let deliveries = 0;
  for (const endpoint of endpoints) {
    if (
      endpoint.status !== "active" ||
      !activePartnerAppIds.has(endpoint.partnerAppId) ||
      !endpoint.events.includes(args.eventType)
    ) {
      continue;
    }

    const deliveryId = await ctx.db.insert("partnerWebhookDeliveries", {
      endpointId: endpoint._id,
      partnerAppId: endpoint.partnerAppId,
      organizationId: args.organizationId,
      eventId: args.eventId,
      eventType: args.eventType,
      payload: encryptedPlaceholder(),
      encryptedPayload: await protectOrganizationJson(args.organizationId, "partner-webhook-delivery", args.payload),
      payloadRedacted: true,
      status: "pending",
      attemptCount: 0,
      nextAttemptAt: now,
      expiresAt: now + 90 * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });
    deliveries += 1;
    await ctx.scheduler.runAfter(0, api.partnerApps.webhooks.deliver, { deliveryId });
  }

  return { deliveries };
}

export async function getWebhookDeliveryTarget(ctx: QueryCtx, deliveryId: Id<"partnerWebhookDeliveries">) {
  const delivery = await ctx.db.get(deliveryId);
  if (!delivery) return null;
  const endpoint = await ctx.db.get(delivery.endpointId);
  if (!endpoint) return null;
  return { delivery, endpoint };
}

export async function markWebhookDeliveryAttempt(
  ctx: MutationCtx,
  args: {
    deliveryId: Id<"partnerWebhookDeliveries">;
    ok: boolean;
    status?: number;
    error?: string;
  },
) {
  const delivery = await ctx.db.get(args.deliveryId);
  if (!delivery) return null;

  const now = Date.now();
  const nextAttemptCount = delivery.attemptCount + 1;
  if (args.ok) {
    await ctx.db.patch(args.deliveryId, {
      status: "succeeded",
      attemptCount: nextAttemptCount,
      lastAttemptAt: now,
      lastStatus: args.status,
      lastError: undefined,
      nextAttemptAt: undefined,
      updatedAt: now,
    });
    return { retry: false };
  }

  const nextDelay = RETRY_DELAYS_MS[nextAttemptCount];
  const hasRetry = nextDelay !== undefined;
  await ctx.db.patch(args.deliveryId, {
    status: hasRetry ? "pending" : "failed",
    attemptCount: nextAttemptCount,
    lastAttemptAt: now,
    lastStatus: args.status,
    lastError: args.error,
    nextAttemptAt: hasRetry ? now + nextDelay : undefined,
    updatedAt: now,
  });

  if (hasRetry) {
    await ctx.scheduler.runAfter(nextDelay, api.partnerApps.webhooks.deliver, {
      deliveryId: args.deliveryId,
    });
  }

  return { retry: hasRetry };
}
