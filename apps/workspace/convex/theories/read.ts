import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeWorkspaceRows } from "../workspace/readSurface";
import { theoryValidator } from "./validators";

const MAX_LIST_THEORIES = 500;

function presentTheory<TDoc extends { _id: string }>(doc: TDoc) {
  return { ...doc, id: doc._id };
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_THEORIES);
    return activeWorkspaceRows(theories)
      .filter((t) => !t.isPrivate)
      .map(presentTheory);
  },
});

export const listPrivate = query({
  args: { organizationId: v.string(), userId: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization_private", (q) =>
        q.eq("organizationId", args.organizationId).eq("isPrivate", true),
      )
      .take(MAX_LIST_THEORIES);
    return activeWorkspaceRows(theories)
      .filter((t) => t.createdByUserId === args.userId)
      .map(presentTheory);
  },
});

export const listAll = query({
  args: { organizationId: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_THEORIES);
    return activeWorkspaceRows(theories).map(presentTheory);
  },
});

export const get = query({
  args: { organizationId: v.string(), theoryId: v.id("theories") },
  returns: v.union(theoryValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theory = await ctx.db.get(args.theoryId);
    if (!theory || theory.organizationId !== args.organizationId || theory.deletedAt) return null;
    return presentTheory(theory);
  },
});

export const search = query({
  args: { organizationId: v.string(), query: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const needle = args.query.trim().toLowerCase();
    if (!needle) return [];
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_THEORIES);
    return activeWorkspaceRows(theories)
      .filter((t) =>
        [t.title, t.content, ...(t.tags ?? [])].some((v) => v?.toLowerCase().includes(needle)),
      )
      .map(presentTheory);
  },
});
