import { v } from "convex/values";
import { query } from "../../_generated/server";
import { assertOrganizationPermission } from "../profile/access";
import { toPublicAuditEvent } from "./data";
import { organizationAuditEventValidator } from "./validators";

export const listRecent = query({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(organizationAuditEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");

    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));
    const events = await ctx.db
      .query("organizationAuditEvents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return events.map(toPublicAuditEvent);
  },
});
