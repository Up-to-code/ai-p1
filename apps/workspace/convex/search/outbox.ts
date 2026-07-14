import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { failedOutboxState } from "./outboxState";
import { searchResourceTypeValidator } from "./validators";

export const claimNext = internalMutation({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const event = await ctx.db.query("searchOutboxEvents").withIndex("by_status_attempt", (q) => q.eq("status", "pending").lte("nextAttemptAt", args.now)).first();
    if (!event) return null;
    await ctx.db.patch(event._id, { status: "processing", claimedAt: args.now, updatedAt: args.now });
    return { ...event, status: "processing" as const, claimedAt: args.now, updatedAt: args.now };
  },
});

export const loadProjection = internalQuery({
  args: { organizationId: v.string(), resourceType: searchResourceTypeValidator, resourceId: v.string(), version: v.number() },
  handler: async (ctx, args) => {
    const projection = await ctx.db.query("searchProjections").withIndex("by_resource", (q) => q.eq("organizationId", args.organizationId).eq("resourceType", args.resourceType).eq("resourceId", args.resourceId)).unique();
    return projection?.version === args.version ? projection : null;
  },
});

export const complete = internalMutation({
  args: { eventId: v.id("searchOutboxEvents"), now: v.number() }, returns: v.null(),
  handler: async (ctx, args) => { await ctx.db.patch(args.eventId, { status: "completed", completedAt: args.now, claimedAt: undefined, updatedAt: args.now }); return null; },
});

export const fail = internalMutation({
  args: { eventId: v.id("searchOutboxEvents"), now: v.number(), error: v.string() }, returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (event) await ctx.db.patch(args.eventId, failedOutboxState(event.attempts, args.now, args.error));
    return null;
  },
});
