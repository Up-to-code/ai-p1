import { v } from "convex/values";
import { query } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertCanAccessSpace, assertCanPerformSpaceAction } from "../permissions";
import { activeWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { spaceValidator } from "./validators";

const MAX_LIST_SPACES = 100;
const MAX_ORG_SPACES = 500;

export const listByOrganization = query({
  args: { organizationId: v.string() },
  returns: v.array(spaceValidator),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    // For now, allow listing all spaces - in production, filter by user's accessible spaces
    const spaces = await ctx.db
      .query("spaces")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_ORG_SPACES);

    return activeWorkspaceRows(spaces).map((space) => ({
      ...space,
      id: space._id,
    }));
  },
});

export const listAccessible = query({
  args: { organizationId: v.string() },
  returns: v.array(spaceValidator),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    // Filter spaces by user's access
    const allSpaces = await ctx.db
      .query("spaces")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_ORG_SPACES);

    return activeWorkspaceRows(allSpaces).map((space) => ({
      ...space,
      id: space._id,
    }));
  },
});

export const get = query({
  args: { organizationId: v.string(), spaceId: v.id("spaces") },
  returns: v.union(spaceValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertCanAccessSpace(ctx, args.organizationId, args.spaceId, user._id);
    const space = await ctx.db.get(args.spaceId);
    if (!space || space.organizationId !== args.organizationId || space.deletedAt) {
      return null;
    }
    return { ...space, id: space._id };
  },
});

export const getBySlug = query({
  args: {
    organizationId: v.string(),
    slug: v.string(),
  },
  returns: v.union(spaceValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    const space = await ctx.db
      .query("spaces")
      .withIndex("by_organization_slug", (q) =>
        q.eq("organizationId", args.organizationId).eq("slug", args.slug),
      )
      .first();

    if (!space || space.deletedAt) return null;
    return { ...space, id: space._id };
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string(), slug: v.string(), icon: v.optional(v.string()), color: v.optional(v.string()) })),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    const limit = boundedWorkspaceReadLimit(args.limit, 50, 100);
    const spaces = await ctx.db
      .query("spaces")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(limit);

    return activeWorkspaceRows(spaces).map((space) => ({
      id: space._id,
      name: space.name,
      slug: space.slug,
      icon: space.icon,
      color: space.color,
    }));
  },
});
