import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { partnerAppsRuntimeConfig } from "../../src/packages/config/partner-apps";
import {
  inboundWebhookInputValidator,
  webhookEndpointInputValidator,
} from "./validators";
import {
  encryptedPlaceholder,
  protectOrganizationJson,
  revealOrganizationJson,
} from "../security/organizationData";
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
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
}

function assertSafeWebhookUrl(value: string) {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase().replace(/^\[/u, "").replace(/\]$/u, "");
  const privateHost = hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "metadata.google.internal" ||
    isPrivateIpv4(hostname) ||
    hostname === "::1" ||
    hostname.startsWith("fc") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("fe80:");

  if (url.protocol !== "https:" || url.username || url.password || privateHost) {
    throw new Error("Webhook URL must be HTTPS and cannot target local or private network hosts.");
  }
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) throw new Error("Invalid encrypted webhook secret.");
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

function configuredServerToken() {
  return process.env.WORKSPACE_CONVEX_BRIDGE_SECRET ?? "";
}

function timingSafeEqual(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let index = 0; index < maxLength; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return diff === 0;
}

function assertServerToken(token: string) {
  const configured = configuredServerToken();
  if (configured.length < 32 || !timingSafeEqual(token, configured)) {
    throw new Error("Invalid server function token.");
  }
}

async function webhookSecretEncryptionKey() {
  const secret = partnerAppsRuntimeConfig.webhookSecretEncryptionKey.trim();
  if (!secret) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return await crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

async function protectWebhookSecret(secret: string) {
  const key = await webhookSecretEncryptionKey();
  if (!key) throw new Error("Webhook secret encryption key is required.");

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(secret),
  );
  return `aesgcm:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
}

async function revealWebhookSecret(storedSecret: string) {
  if (storedSecret.startsWith("plain:")) return storedSecret.slice("plain:".length);
  if (!storedSecret.startsWith("aesgcm:")) return storedSecret;

  const [, ivHex, ciphertextHex] = storedSecret.split(":");
  const key = await webhookSecretEncryptionKey();
  if (!key || !ivHex || !ciphertextHex) {
    throw new Error("Webhook secret encryption key is required.");
  }

  const secret = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBytes(ivHex) },
    key,
    hexToBytes(ciphertextHex),
  );
  return new TextDecoder().decode(secret);
}

export async function buildWebhookSignature(secret: string, timestamp: number, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  return `v1=${bytesToHex(new Uint8Array(signature))}`;
}

function randomSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `whsec_${bytesToHex(bytes)}`;
}

function presentEndpoint(endpoint: Doc<"partnerWebhookEndpoints">) {
  const safeEndpoint: Partial<Doc<"partnerWebhookEndpoints">> = { ...endpoint };
  delete safeEndpoint.signingSecret;
  return { ...safeEndpoint, id: endpoint._id };
}

function clientFields(input: Input) {
  return {
    name: optionalString(input, "name") ?? "Partner client",
    type: (optionalString(input, "type") ?? "Buyer") as "Buyer" | "Tenant" | "Investor" | "Broker",
    contact: optionalString(input, "contact") ?? optionalString(input, "name") ?? "Partner client",
    phone: optionalString(input, "phone") ?? "",
    age: optionalNumber(input, "age") ?? 0,
    nationality: optionalString(input, "nationality") ?? "",
    generation: optionalString(input, "generation") ?? "",
    budget: optionalString(input, "budget") ?? "",
    propertyInterest: optionalString(input, "propertyInterest") ?? "",
    status: (optionalString(input, "status") ?? "active") as "active" | "inactive",
    visibility: "private" as const,
    pipelineStage: (optionalString(input, "pipelineStage") ?? "new") as "new" | "qualified" | "viewing" | "negotiation" | "closed",
    ...(optionalNumber(input, "pipelineOrder") !== undefined ? { pipelineOrder: optionalNumber(input, "pipelineOrder")! } : {}),
    priority: (optionalString(input, "priority") ?? "normal") as "normal" | "high" | "urgent",
    nextAction: optionalString(input, "nextAction") ?? "",
    issue: optionalString(input, "issue"),
  };
}

export const createEndpointFromHono = mutation({
  args: {
    partnerAppId: v.string(),
    organizationId: v.string(),
    input: webhookEndpointInputValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "update");
    assertSafeWebhookUrl(args.input.url);

    const now = Date.now();
    const endpointId = await ctx.db.insert("partnerWebhookEndpoints", {
      partnerAppId: args.partnerAppId,
      organizationId: args.input.organizationId ?? args.organizationId,
      url: args.input.url,
      signingSecret: await protectWebhookSecret(randomSecret()),
      events: args.input.events,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return presentEndpoint((await ctx.db.get(endpointId))!);
  },
});

export const acceptInboundFromHono = mutation({
  args: {
    serverToken: v.string(),
    organizationId: v.string(),
    partnerAppId: v.string(),
    input: inboundWebhookInputValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertServerToken(args.serverToken);
    const byEventId = await ctx.db
      .query("partnerInboundEvents")
      .withIndex("by_partner_event", (q) =>
        q.eq("partnerAppId", args.partnerAppId).eq("eventId", args.input.eventId),
      )
      .unique();
    if (byEventId) return { accepted: true, duplicate: true, eventId: byEventId._id };

    if (args.input.idempotencyKey) {
      const byIdempotencyKey = await ctx.db
        .query("partnerInboundEvents")
        .withIndex("by_partner_idempotency", (q) =>
          q.eq("partnerAppId", args.partnerAppId).eq("idempotencyKey", args.input.idempotencyKey),
        )
        .unique();
      if (byIdempotencyKey) return { accepted: true, duplicate: true, eventId: byIdempotencyKey._id };
    }

    const now = Date.now();
    const expiresAt = now + 90 * 24 * 60 * 60 * 1000;
    const eventRecordId = await ctx.db.insert("partnerInboundEvents", {
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
      expiresAt,
      createdAt: now,
    });

    if (args.input.eventType === "client.upsert") {
      const data = objectInput(args.input.data);
      const externalId = optionalString(data, "externalId");
      const client = objectInput(data.client ?? data);
      if (externalId) {
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
    }

    return { accepted: true, duplicate: false, eventId: eventRecordId };
  },
});

export const enqueueOutbound = internalMutation({
  args: {
    organizationId: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payload: v.any(),
  },
  returns: v.object({ deliveries: v.number() }),
  handler: async (ctx, args) => {
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
  },
});

export const getDeliveryTarget = internalQuery({
  args: { deliveryId: v.id("partnerWebhookDeliveries") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId);
    if (!delivery) return null;
    const endpoint = await ctx.db.get(delivery.endpointId);
    if (!endpoint) return null;
    return { delivery, endpoint };
  },
});

export const markDeliveryAttempt = internalMutation({
  args: {
    deliveryId: v.id("partnerWebhookDeliveries"),
    ok: v.boolean(),
    status: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
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
  },
});

export const deliver = action({
  args: { deliveryId: v.id("partnerWebhookDeliveries") },
  returns: v.any(),
  handler: async (ctx, args): Promise<unknown> => {
    const target: { delivery: Doc<"partnerWebhookDeliveries">; endpoint: Doc<"partnerWebhookEndpoints"> } | null =
      await ctx.runQuery(internal.partnerApps.webhooks.getDeliveryTarget, args);
    if (!target || target.endpoint.status !== "active") {
      return await ctx.runMutation(internal.partnerApps.webhooks.markDeliveryAttempt, {
        deliveryId: args.deliveryId,
        ok: false,
        error: "endpoint_not_available",
      });
    }

    const timestamp = Date.now();
    const payload = target.delivery.encryptedPayload
      ? await revealOrganizationJson(target.delivery.organizationId, "partner-webhook-delivery", target.delivery.encryptedPayload, target.delivery.payload ?? null)
      : target.delivery.payload;
    const body = JSON.stringify({
      id: target.delivery.eventId,
      type: target.delivery.eventType,
      organizationId: target.delivery.organizationId,
      createdAt: target.delivery.createdAt,
      data: payload,
    });
    const signingSecret = await revealWebhookSecret(target.endpoint.signingSecret);
    const signature = await buildWebhookSignature(signingSecret, timestamp, body);

    try {
      const response: Response = await fetch(target.endpoint.url, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
          "Qentrah-Event-Id": target.delivery.eventId,
          "Qentrah-Event-Type": target.delivery.eventType,
          "Qentrah-Timestamp": String(timestamp),
          "Qentrah-Delivery-Id": args.deliveryId,
          "Qentrah-Signature": signature,
        },
        body,
      });

      return await ctx.runMutation(internal.partnerApps.webhooks.markDeliveryAttempt, {
        deliveryId: args.deliveryId,
        ok: response.ok,
        status: response.status,
        error: response.ok ? undefined : await response.text().catch(() => response.statusText),
      });
    } catch (error) {
      return await ctx.runMutation(internal.partnerApps.webhooks.markDeliveryAttempt, {
        deliveryId: args.deliveryId,
        ok: false,
        error: error instanceof Error ? error.message : "delivery_failed",
      });
    }
  },
});
