import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { failedOutboxState } from "./outboxState";
import { searchOutboxEventValidator, searchPolicyValidator, searchProjectionValidator, searchResourceTypeValidator } from "./validators";

const CLAIM_LEASE_MS = 2 * 60_000;

export const claimNext = internalMutation({
  args: { now: v.number() },
  returns: v.union(searchOutboxEventValidator, v.null()),
  handler: async (ctx, args) => {
    const event = await ctx.db.query("searchOutboxEvents").withIndex("by_status_attempt", (q) => q.eq("status", "pending").lte("nextAttemptAt", args.now)).first()
      ?? await ctx.db.query("searchOutboxEvents").withIndex("by_status_attempt", (q) => q.eq("status", "processing").lte("nextAttemptAt", args.now)).first();
    if (!event) return null;
    const claimed = { status: "processing" as const, claimedAt: args.now, nextAttemptAt: args.now + CLAIM_LEASE_MS, updatedAt: args.now };
    await ctx.db.patch(event._id, claimed);
    return { ...event, ...claimed };
  },
});

export const loadProjection = internalQuery({
  args: { organizationId: v.string(), resourceType: searchResourceTypeValidator, resourceId: v.string(), version: v.number() },
  returns: v.union(searchProjectionValidator, v.null()),
  handler: async (ctx, args) => {
    const projection = await ctx.db.query("searchProjections").withIndex("by_resource", (q) => q.eq("organizationId", args.organizationId).eq("resourceType", args.resourceType).eq("resourceId", args.resourceId)).unique();
    return projection?.version === args.version ? projection : null;
  },
});

export const loadPolicy = internalQuery({
  args: { organizationId: v.string() },
  returns: v.union(searchPolicyValidator, v.null()),
  handler: (ctx, args) => ctx.db.query("searchPolicies").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId)).unique(),
});

export const indexSettingsVersion = internalQuery({
  args: { indexName: v.string() },
  returns: v.union(v.number(), v.null()),
  handler: async (ctx, args) => (await ctx.db.query("searchIndexStates").withIndex("by_index_name", (q) => q.eq("indexName", args.indexName)).unique())?.settingsVersion ?? null,
});

export const markIndexConfigured = internalMutation({
  args: { indexName: v.string(), settingsVersion: v.number(), now: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("searchIndexStates").withIndex("by_index_name", (q) => q.eq("indexName", args.indexName)).unique();
    if (existing) await ctx.db.patch(existing._id, { settingsVersion: args.settingsVersion, configuredAt: args.now });
    else await ctx.db.insert("searchIndexStates", { indexName: args.indexName, settingsVersion: args.settingsVersion, configuredAt: args.now });
    return null;
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
