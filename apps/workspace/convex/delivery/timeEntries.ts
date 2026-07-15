import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { resolveDeliveryAccess } from "../access/delivery";
import { requireServerActor } from "../access/actor";
import { timeEntryValidator } from "./validators";

export const recordTimeEntry = mutation({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.id("projects"), taskId: v.optional(v.id("tasks")), workDate: v.number(), minutes: v.number(), description: v.optional(v.string()), billable: v.boolean(), rateCardEntryId: v.optional(v.id("resourceRateCardEntries")) }, returns: v.id("deliveryTimeEntries"),
  handler: async (ctx, args) => { const actor = await requireServerActor(ctx); const access = await resolveDeliveryAccess(ctx, args.organizationId); const engagement = await ctx.db.get(args.engagementId); if (!engagement || engagement.organizationId !== args.organizationId || engagement.deletedAt) throw new Error("Engagement was not found."); await access.assertCanUpdate(engagement); const link = await ctx.db.query("engagementProjects").withIndex("by_engagement_project", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", args.engagementId).eq("projectId", args.projectId)).unique(); if (!link || link.deletedAt) throw new Error("Project is not linked to this Engagement."); if (!Number.isSafeInteger(args.minutes) || args.minutes <= 0 || args.minutes > 24 * 60) throw new Error("Time entry minutes must be from 1 to 1440."); if (args.rateCardEntryId) { const rate = await ctx.db.get(args.rateCardEntryId); if (!rate || rate.organizationId !== args.organizationId || rate.deletedAt) throw new Error("Rate card entry is unavailable."); } const now = Date.now(); return ctx.db.insert("deliveryTimeEntries", { ...args, userId: actor.userId, status: "draft", ownerUserId: actor.userId, recordState: "active", createdByUserId: actor.userId, createdAt: now, updatedAt: now }); },
});

export const submitTimeEntry = mutation({
  args: { organizationId: v.string(), timeEntryId: v.id("deliveryTimeEntries") }, returns: v.null(),
  handler: async (ctx, args) => { const actor = await requireServerActor(ctx); const entry = await ctx.db.get(args.timeEntryId); if (!entry || entry.organizationId !== args.organizationId || entry.deletedAt || entry.userId !== actor.userId || entry.status !== "draft") throw new Error("Only the owner can submit a draft time entry."); await ctx.db.patch(entry._id, { status: "submitted", updatedAt: Date.now() }); return null; },
});

export const decideTimeEntry = mutation({
  args: { organizationId: v.string(), timeEntryId: v.id("deliveryTimeEntries"), decision: v.union(v.literal("approved"), v.literal("rejected")) }, returns: v.null(),
  handler: async (ctx, args) => { const access = await resolveDeliveryAccess(ctx, args.organizationId); const entry = await ctx.db.get(args.timeEntryId); if (!entry || entry.organizationId !== args.organizationId || entry.deletedAt || entry.status !== "submitted") throw new Error("Time entry is not pending approval."); const engagement = await ctx.db.get(entry.engagementId); if (!engagement) throw new Error("Engagement was not found."); await access.assertCanUpdate(engagement); const now = Date.now(); await ctx.db.patch(entry._id, { status: args.decision, approvedByUserId: access.actor.userId, approvedAt: args.decision === "approved" ? now : undefined, updatedAt: now }); return null; },
});

export const listTimeEntries = query({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), startAt: v.number(), endAt: v.number() }, returns: v.array(timeEntryValidator),
  handler: async (ctx, args) => { const access = await resolveDeliveryAccess(ctx, args.organizationId); const engagement = await ctx.db.get(args.engagementId); if (!engagement || engagement.organizationId !== args.organizationId || !await access.canRead(engagement)) return []; return ctx.db.query("deliveryTimeEntries").withIndex("by_engagement_date", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", args.engagementId).gte("workDate", args.startAt).lte("workDate", args.endAt)).take(1000); },
});
