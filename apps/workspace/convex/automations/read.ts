import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  automationDocumentValidator,
  automationRunDocumentValidator,
} from "./validators";

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(automationDocumentValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      "organization",
      "read",
    );
    return await ctx.db
      .query("automations")
      .withIndex("by_organization_updated", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .collect();
  },
});

export const listRuns = query({
  args: { organizationId: v.string(), automationId: v.id("automations") },
  returns: v.array(automationRunDocumentValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      "organization",
      "read",
    );
    const automation = await ctx.db.get(args.automationId);
    if (!automation || automation.organizationId !== args.organizationId) return [];
    return await ctx.db
      .query("automationRuns")
      .withIndex("by_automation_started", (q) =>
        q.eq("automationId", args.automationId),
      )
      .order("desc")
      .take(50);
  },
});

export const organizationRuns = query({
  args: { organizationId: v.string(), status: v.optional(v.union(v.literal("running"), v.literal("pending_approval"), v.literal("success"), v.literal("failed"))) },
  returns: v.array(automationRunDocumentValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    if (args.status) return ctx.db.query("automationRuns").withIndex("by_org_status_started", (q) => q.eq("organizationId", args.organizationId).eq("status", args.status!)).order("desc").take(100);
    return ctx.db.query("automationRuns").withIndex("by_organization_started", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(100);
  },
});

export const pendingApprovals = query({
  args: { organizationId: v.string() },
  returns: v.array(v.object({ id: v.id("automationApprovals"), automationId: v.id("automations"), runId: v.id("automationRuns"), actionType: v.string(), requestedAt: v.number(), expiresAt: v.number() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "update");
    const rows = await ctx.db.query("automationApprovals").withIndex("by_org_status_requested", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending")).order("desc").take(100);
    return rows.map((row) => ({ id: row._id, automationId: row.automationId, runId: row.runId, actionType: row.actionType, requestedAt: row.requestedAt, expiresAt: row.expiresAt }));
  },
});
