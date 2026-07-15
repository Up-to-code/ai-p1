import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../../_generated/server";
import { assertOrganizationPermission } from "../profile/access";
import { auditStats } from "../../workspace/readStats";
import { auditCategoryForAction, toPublicAuditEvent } from "./data";
import { organizationAuditEventValidator } from "./validators";
import { resolveOrganizationEntitlements } from "../../billing/access";

const MAX_AUDIT_STATS_EVENTS = 2_000;

async function auditCutoff(ctx: Parameters<typeof resolveOrganizationEntitlements>[0], organizationId: string) {
  const entitlements = await resolveOrganizationEntitlements(ctx, organizationId);
  return entitlements.auditLogDays === null
    ? 0
    : Date.now() - entitlements.auditLogDays * 24 * 60 * 60 * 1_000;
}

export const listRecent = query({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(organizationAuditEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");

    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));
    const cutoff = await auditCutoff(ctx, args.organizationId);
    const events = await ctx.db
      .query("organizationAuditEvents")
      .withIndex("by_organization_created", (q) => q.eq("organizationId", args.organizationId).gte("createdAt", cutoff))
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
    const cutoff = await auditCutoff(ctx, args.organizationId);
    const page = await ctx.db
      .query("organizationAuditEvents")
      .withIndex("by_organization_created", (q) => q.eq("organizationId", args.organizationId).gte("createdAt", cutoff))
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
    const cutoff = await auditCutoff(ctx, args.organizationId);
    const events = await ctx.db
      .query("organizationAuditEvents")
      .withIndex("by_organization_created", (q) => q.eq("organizationId", args.organizationId).gte("createdAt", cutoff))
      .order("desc")
      .take(MAX_AUDIT_STATS_EVENTS);
    return auditStats(events, auditCategoryForAction);
  },
});
