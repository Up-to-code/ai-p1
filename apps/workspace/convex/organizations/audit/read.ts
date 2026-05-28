import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../../_generated/server";
import { assertOrganizationPermission } from "../profile/access";
import { auditStats } from "../../workspace/readStats";
import { auditCategoryForAction, toPublicAuditEvent } from "./data";
import { organizationAuditEventValidator } from "./validators";

const MAX_AUDIT_STATS_EVENTS = 2_000;

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

export const listPaged = query({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const page = await ctx.db
      .query("organizationAuditEvents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...page,
      page: page.page.map(toPublicAuditEvent),
    };
  },
});

export const stats = query({
  args: { organizationId: v.string() },
  returns: v.object({
    total: v.number(),
    people: v.number(),
    business: v.number(),
    latestAt: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const events = await ctx.db
      .query("organizationAuditEvents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(MAX_AUDIT_STATS_EVENTS);
    return auditStats(events, auditCategoryForAction);
  },
});
