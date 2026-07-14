import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";

export const health = query({
  args: { organizationId: v.string() },
  returns: v.object({ pendingCount: v.number(), deadLetterCount: v.number(), oldestPendingAt: v.union(v.number(), v.null()) }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const [pending, processing, deadLetters] = await Promise.all([
      ctx.db.query("searchOutboxEvents").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending")).collect(),
      ctx.db.query("searchOutboxEvents").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "processing")).collect(),
      ctx.db.query("searchOutboxEvents").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "dead_letter")).collect(),
    ]);
    const active = [...pending, ...processing];
    return { pendingCount: active.length, deadLetterCount: deadLetters.length, oldestPendingAt: active.length ? Math.min(...active.map((event) => event.createdAt)) : null };
  },
});
