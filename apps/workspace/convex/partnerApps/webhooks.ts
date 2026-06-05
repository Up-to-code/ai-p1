import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  inboundWebhookInputValidator,
  webhookEndpointInputValidator,
} from "./validators";
import { assertConvexBridgeToken } from "../serviceTokens";
import { revealOrganizationJson } from "../security/organizationData";
import { assertSafeWebhookUrl } from "./webhookUrlSafety";
import {
  buildWebhookSignature,
  protectWebhookSecret,
  randomWebhookSecret,
  revealWebhookSecret,
} from "./webhookSecrets";
import {
  applyInboundClientUpsert,
  enqueueWebhookDeliveries,
  findDuplicateInboundEvent,
  getWebhookDeliveryTarget,
  insertInboundEvent,
  markWebhookDeliveryAttempt,
  presentEndpoint,
} from "./webhookDelivery";

export { buildWebhookSignature } from "./webhookSecrets";

export const createEndpointFromHono = mutation({
  args: {
    partnerAppId: v.string(),
    organizationId: v.string(),
    input: webhookEndpointInputValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "update");
    assertSafeWebhookUrl(args.input.url);

    const now = Date.now();
    const endpointId = await ctx.db.insert("partnerWebhookEndpoints", {
      partnerAppId: args.partnerAppId,
      organizationId: args.input.organizationId ?? args.organizationId,
      url: args.input.url,
      signingSecret: await protectWebhookSecret(randomWebhookSecret()),
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
    assertConvexBridgeToken(args.serverToken);
    const duplicate = await findDuplicateInboundEvent(ctx, {
      partnerAppId: args.partnerAppId,
      eventId: args.input.eventId,
      idempotencyKey: args.input.idempotencyKey,
    });
    if (duplicate) return { accepted: true, duplicate: true, eventId: duplicate._id };

    const eventRecordId = await insertInboundEvent(ctx, args);
    await applyInboundClientUpsert(ctx, {
      organizationId: args.organizationId,
      partnerAppId: args.partnerAppId,
      eventType: args.input.eventType,
      data: args.input.data,
    });

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
    return await enqueueWebhookDeliveries(ctx, args);
  },
});

export const getDeliveryTarget = internalQuery({
  args: { deliveryId: v.id("partnerWebhookDeliveries") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await getWebhookDeliveryTarget(ctx, args.deliveryId);
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
    return await markWebhookDeliveryAttempt(ctx, args);
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
