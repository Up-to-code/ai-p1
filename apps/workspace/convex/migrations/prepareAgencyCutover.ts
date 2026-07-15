import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

const resources = ["project", "task", "lead", "company", "contact", "proposal", "contract", "engagement", "deliverable", "invoice", "expense", "payment"] as const;

export const runBatch = internalMutation({
  args: { cursor: v.optional(v.string()), batchSize: v.optional(v.number()), dryRun: v.optional(v.boolean()) },
  returns: v.object({ organizations: v.number(), layouts: v.number(), rollouts: v.number(), reindexJobs: v.number(), cursor: v.optional(v.string()), done: v.boolean() }),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("organizations").paginate({ cursor: args.cursor ?? null, numItems: Math.min(Math.max(args.batchSize ?? 25, 1), 100) });
    let layouts = 0, rollouts = 0, reindexJobs = 0; const now = Date.now(), dryRun = args.dryRun ?? false;
    for (const profile of page.page) {
      const organizationId = profile.organizationId;
      const [layout, rollout] = await Promise.all([
        ctx.db.query("organizationNavigationLayouts").withIndex("by_organization_role", (q) => q.eq("organizationId", organizationId).eq("roleKey", "default")).unique(),
        ctx.db.query("organizationPlatformRollouts").withIndex("by_organization_feature", (q) => q.eq("organizationId", organizationId).eq("featureKey", "agency_os")).unique(),
      ]);
      if (!layout) { layouts += 1; if (!dryRun) await ctx.db.insert("organizationNavigationLayouts", { organizationId, roleKey: "default", domainOrder: [], hiddenOptionalNodeIds: [], aliases: {}, railMode: "compact", secondaryPanelWidth: 248, version: 1, updatedByUserId: "system:agency-cutover", createdAt: now, updatedAt: now }); }
      if (!rollout) { rollouts += 1; if (!dryRun) await ctx.db.insert("organizationPlatformRollouts", { organizationId, featureKey: "agency_os", stage: "canonical", version: 1, updatedByUserId: "system:agency-cutover", createdAt: now, updatedAt: now }); }
      for (const resourceType of resources) {
        let active = false;
        for (const status of ["pending", "running"] as const) if (await ctx.db.query("searchReindexJobs").withIndex("by_organization_resource_status", (q) => q.eq("organizationId", organizationId).eq("resourceType", resourceType).eq("status", status)).first()) active = true;
        if (!active) { reindexJobs += 1; if (!dryRun) await ctx.db.insert("searchReindexJobs", { organizationId, resourceType, status: "pending", processed: 0, requestedByUserId: "system:agency-cutover", createdAt: now, updatedAt: now }); }
      }
    }
    return { organizations: page.page.length, layouts, rollouts, reindexJobs, cursor: page.isDone ? undefined : page.continueCursor, done: page.isDone };
  },
});
