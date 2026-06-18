import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeUpdatedWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { dealStageValidator, dealValidator } from "./validators";

const MAX_LIST_DEALS = 500;

function presentDeal<TDeal extends { _id: string }>(deal: TDeal) {
  return { ...deal, id: deal._id };
}

function matchesSearch(
  deal: { title: string; source?: string; nextStep?: string; dealThinking?: string; tags?: string[] },
  search?: string,
) {
  const query = search?.trim().toLowerCase();
  if (!query) return true;
  return [
    deal.title,
    deal.source,
    deal.nextStep,
    deal.dealThinking,
    ...(deal.tags ?? []),
  ].some((value) => value?.toLowerCase().includes(query));
}

export const list = query({
  args: {
    organizationId: v.string(),
    stage: v.optional(dealStageValidator),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(dealValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, MAX_LIST_DEALS, MAX_LIST_DEALS);
    const deals = args.stage
      ? await ctx.db
          .query("deals")
          .withIndex("by_organization_stage", (q) => q.eq("organizationId", args.organizationId).eq("stage", args.stage!))
          .take(limit)
      : await ctx.db
          .query("deals")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
          .take(limit);

    return activeUpdatedWorkspaceRows(deals)
      .filter((deal) => matchesSearch(deal, args.search))
      .map(presentDeal);
  },
});

export const get = query({
  args: { organizationId: v.string(), dealId: v.id("deals") },
  returns: v.union(dealValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const deal = await ctx.db.get(args.dealId);
    if (!deal || deal.organizationId !== args.organizationId || deal.deletedAt) return null;
    return presentDeal(deal);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), title: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(limit);

    return activeUpdatedWorkspaceRows(deals).map((deal) => ({
      id: deal._id,
      title: deal.title,
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
    totalValue: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const deals = activeUpdatedWorkspaceRows(await ctx.db
      .query("deals")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_DEALS));

    return {
      total: deals.length,
      open: deals.filter((deal) => deal.status === "open").length,
      qualified: deals.filter((deal) => deal.stage === "qualified").length,
      won: deals.filter((deal) => deal.status === "won").length,
      lost: deals.filter((deal) => deal.status === "lost").length,
      totalValue: deals.reduce((sum, deal) => sum + (deal.value ?? 0), 0),
    };
  },
});
