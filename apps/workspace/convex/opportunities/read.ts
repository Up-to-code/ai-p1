import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeUpdatedWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { presentWorkspaceRecord } from "../shared/present";
import { opportunityStageValidator, opportunityValidator } from "./validators";

const MAX_LIST_OPPORTUNITIES = 500;

function presentOpportunity<TOpportunity extends { _id: string }>(opportunity: TOpportunity) {
  return presentWorkspaceRecord(opportunity);
}

function matchesSearch(
  opportunity: { title: string; source?: string; nextStep?: string; tags?: string[] },
  search?: string,
) {
  const query = search?.trim().toLowerCase();
  if (!query) return true;
  return [
    opportunity.title,
    opportunity.source,
    opportunity.nextStep,
    ...(opportunity.tags ?? []),
  ].some((value) => value?.toLowerCase().includes(query));
}

export const list = query({
  args: {
    organizationId: v.string(),
    stage: v.optional(opportunityStageValidator),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(opportunityValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, MAX_LIST_OPPORTUNITIES, MAX_LIST_OPPORTUNITIES);
    const opportunities = args.stage
      ? await ctx.db
          .query("opportunities")
          .withIndex("by_organization_stage", (q) => q.eq("organizationId", args.organizationId).eq("stage", args.stage!))
          .take(limit)
      : await ctx.db
          .query("opportunities")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
          .take(limit);

    return activeUpdatedWorkspaceRows(opportunities)
      .filter((opportunity) => matchesSearch(opportunity, args.search))
      .map(presentOpportunity);
  },
});

export const get = query({
  args: { organizationId: v.string(), opportunityId: v.id("opportunities") },
  returns: v.union(opportunityValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity || opportunity.organizationId !== args.organizationId || opportunity.deletedAt) return null;
    return presentOpportunity(opportunity);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), title: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(limit);

    return activeUpdatedWorkspaceRows(opportunities).map((opportunity) => ({
      id: opportunity._id,
      title: opportunity.title,
    }));
  },
});

export const stats = query({
  args: { organizationId: v.string() },
  returns: v.object({
    total: v.number(),
    open: v.number(),
    qualified: v.number(),
    won: v.number(),
    lost: v.number(),
    value: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const opportunities = activeUpdatedWorkspaceRows(await ctx.db
      .query("opportunities")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_OPPORTUNITIES));

    return {
      total: opportunities.length,
      open: opportunities.filter((opportunity) => opportunity.status === "open").length,
      qualified: opportunities.filter((opportunity) => opportunity.stage === "qualified").length,
      won: opportunities.filter((opportunity) => opportunity.status === "won").length,
      lost: opportunities.filter((opportunity) => opportunity.status === "lost").length,
      value: opportunities.reduce((sum, opportunity) => sum + (opportunity.value ?? 0), 0),
    };
  },
});

