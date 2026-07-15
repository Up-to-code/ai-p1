import { v } from "convex/values";
import { query } from "../_generated/server";
import { resolvePortalAccess } from "./access";

export const engagement = query({
  args: { token: v.string(), engagementId: v.string() },
  returns: v.object({ engagement: v.object({ id: v.id("engagements"), name: v.string(), status: v.string(), health: v.string(), scope: v.string(), startAt: v.optional(v.number()), endAt: v.optional(v.number()) }), deliverables: v.array(v.object({ id: v.id("deliverables"), name: v.string(), description: v.optional(v.string()), status: v.string(), dueAt: v.optional(v.number()) })), approvals: v.array(v.object({ id: v.id("deliveryApprovals"), resourceType: v.string(), resourceId: v.string(), status: v.string(), requestedAt: v.number() })), capabilities: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const access = await resolvePortalAccess(ctx, args.token, args.engagementId, "view");
    const [deliverables, approvals] = await Promise.all([
      ctx.db.query("deliverables").withIndex("by_engagement_status", (q) => q.eq("organizationId", access.session.organizationId).eq("engagementId", access.engagement._id)).collect(),
      ctx.db.query("deliveryApprovals").withIndex("by_engagement_status", (q) => q.eq("organizationId", access.session.organizationId).eq("engagementId", access.engagement._id)).collect(),
    ]);
    return { engagement: { id: access.engagement._id, name: access.engagement.name, status: access.engagement.status, health: access.engagement.health, scope: access.engagement.scope, startAt: access.engagement.startAt, endAt: access.engagement.endAt }, deliverables: deliverables.filter((row) => !row.deletedAt).map((row) => ({ id: row._id, name: row.name, description: row.description, status: row.status, dueAt: row.dueAt })), approvals: approvals.map((row) => ({ id: row._id, resourceType: row.resourceType, resourceId: row.resourceId, status: row.status, requestedAt: row.requestedAt })), capabilities: access.grant.capabilities };
  },
});
