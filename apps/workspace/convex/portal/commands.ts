import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { resolveDeliveryAccess } from "../access/delivery";
import { emitAutomationEvent } from "../automations/events";
import { deliverableSearchProjection, engagementSearchProjection } from "../delivery/search";
import { resolvePortalAccess, hashPortalToken } from "./access";

export const issueSession = mutation({
  args: { organizationId: v.string(), portalIdentityId: v.id("portalIdentities"), expiresAt: v.number() },
  returns: v.object({ token: v.string(), expiresAt: v.number() }),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId); await access.assertCanCreate();
    const identity = await ctx.db.get(args.portalIdentityId);
    if (!identity || identity.organizationId !== args.organizationId || identity.status === "revoked") throw new Error("Portal identity is unavailable.");
    if (args.expiresAt <= Date.now() || args.expiresAt > Date.now() + 90 * 86_400_000) throw new Error("Portal session expiry must be within 90 days.");
    const token = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
    await ctx.db.insert("portalSessions", { organizationId: args.organizationId, portalIdentityId: identity._id, tokenHash: await hashPortalToken(token), status: "active", expiresAt: args.expiresAt, createdByUserId: access.actor.userId, createdAt: Date.now() });
    return { token, expiresAt: args.expiresAt };
  },
});

export const activateSession = mutation({
  args: { token: v.string() }, returns: v.object({ organizationId: v.string(), identityName: v.string() }),
  handler: async (ctx, args) => {
    const tokenHash = await hashPortalToken(args.token), session = await ctx.db.query("portalSessions").withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash)).unique();
    if (!session || session.status !== "active" || session.expiresAt <= Date.now()) throw new Error("Portal session is invalid or expired.");
    const identity = await ctx.db.get(session.portalIdentityId); if (!identity || identity.status === "revoked") throw new Error("Portal identity is unavailable.");
    const now = Date.now(); await ctx.db.patch(session._id, { lastUsedAt: now }); if (identity.status === "invited") await ctx.db.patch(identity._id, { status: "active", activatedAt: now, updatedAt: now });
    return { organizationId: session.organizationId, identityName: identity.name };
  },
});

export const submitRequest = mutation({
  args: { token: v.string(), engagementId: v.string(), type: v.union(v.literal("comment"), v.literal("upload")), resourceType: v.string(), resourceId: v.string(), body: v.optional(v.string()), mediaId: v.optional(v.id("mediaAssets")) },
  returns: v.id("portalRequests"),
  handler: async (ctx, args) => {
    const access = await resolvePortalAccess(ctx, args.token, args.engagementId, args.type);
    if (args.type === "comment" && !args.body?.trim()) throw new Error("Portal comment body is required.");
    if (args.type === "upload") { const media = args.mediaId ? await ctx.db.get(args.mediaId) : null; if (!media || media.organizationId !== access.session.organizationId) throw new Error("Portal upload must reference validated Organization media."); }
    const now = Date.now(); await ctx.db.patch(access.session._id, { lastUsedAt: now });
    return ctx.db.insert("portalRequests", { organizationId: access.session.organizationId, portalIdentityId: access.identity._id, engagementId: access.engagement._id, type: args.type, resourceType: args.resourceType, resourceId: args.resourceId, body: args.body?.trim(), mediaId: args.mediaId, status: "submitted", createdAt: now, updatedAt: now });
  },
});

export const decideDeliveryApproval = mutation({
  args: { token: v.string(), engagementId: v.string(), approvalId: v.id("deliveryApprovals"), decision: v.union(v.literal("approved"), v.literal("rejected")), note: v.optional(v.string()) },
  returns: v.object({ status: v.union(v.literal("approved"), v.literal("rejected")) }),
  handler: async (ctx, args) => {
    const access = await resolvePortalAccess(ctx, args.token, args.engagementId, "approve"), approval = await ctx.db.get(args.approvalId);
    if (!approval || approval.organizationId !== access.session.organizationId || approval.engagementId !== access.engagement._id || approval.status !== "pending") throw new Error("Portal approval is unavailable.");
    const now = Date.now(); await ctx.db.patch(approval._id, { status: args.decision, decidedByUserId: `portal:${access.identity._id}`, decidedAt: now, decisionNote: args.note?.trim(), updatedAt: now });
    if (approval.resourceType === "deliverable") {
      const id = ctx.db.normalizeId("deliverables", approval.resourceId), deliverable = id ? await ctx.db.get(id) : null;
      if (!deliverable || deliverable.approvalId !== approval._id || deliverable.status !== "submitted") throw new Error("Portal Deliverable approval no longer matches its resource.");
      await ctx.db.patch(deliverable._id, { status: args.decision, approvedAt: args.decision === "approved" ? now : undefined, updatedAt: now }); const updated = await ctx.db.get(deliverable._id); if (updated) await deliverableSearchProjection(ctx, updated);
    } else {
      const id = ctx.db.normalizeId("changeOrders", approval.resourceId), order = id ? await ctx.db.get(id) : null;
      if (!order || order.approvalId !== approval._id || order.status !== "submitted") throw new Error("Portal Change Order approval no longer matches its resource.");
      await ctx.db.patch(order._id, { status: args.decision, approvedAt: args.decision === "approved" ? now : undefined, updatedAt: now });
      if (args.decision === "approved") { await ctx.db.patch(access.engagement._id, { agreedAmountMinor: access.engagement.agreedAmountMinor + order.amountDeltaMinor, updatedAt: now }); const engagement = await ctx.db.get(access.engagement._id); if (engagement) await engagementSearchProjection(ctx, engagement); }
    }
    await ctx.db.patch(access.session._id, { lastUsedAt: now });
    await emitAutomationEvent(ctx, { organizationId: access.session.organizationId, eventType: `${approval.resourceType}.${args.decision}`, resourceType: approval.resourceType, resourceId: approval.resourceId, payload: { engagementId: String(access.engagement._id), portalIdentityId: String(access.identity._id) }, actorUserId: `portal:${access.identity._id}` });
    return { status: args.decision };
  },
});
