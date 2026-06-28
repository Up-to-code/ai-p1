import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { spaceValidator } from "./validators";

const MAX_LIST_SPACES = 100;
const MAX_ORG_SPACES = 500;

export const listByOrganization = query({
  args: { organizationId: v.string() },
  returns: v.array(spaceValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const spaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_ORG_SPACES);

    return activeWorkspaceRows(spaces).map((space) => ({
      ...space,
      id: space._id,
    }));
  },
});

export const list = query({
  args: { organizationId: v.string(), projectId: v.id("projects") },
  returns: v.array(spaceValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const spaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("projectId", args.projectId),
      )
      .take(MAX_LIST_SPACES);

    return activeWorkspaceRows(spaces).map((space) => ({
      ...space,
      id: space._id,
    }));
  },
});

export const get = query({
  args: { organizationId: v.string(), spaceId: v.id("projectSpaces") },
  returns: v.union(spaceValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const space = await ctx.db.get(args.spaceId);
    if (
      !space ||
      space.organizationId !== args.organizationId ||
      space.deletedAt
    ) {
      return null;
    }
    return { ...space, id: space._id };
  },
});

export const getBySlug = query({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    slug: v.string(),
  },
  returns: v.union(spaceValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const space = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_slug", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", args.projectId)
         .eq("slug", args.slug),
      )
      .first();

    if (!space || space.deletedAt) return null;
    return { ...space, id: space._id };
  },
});

export const options = query({
  args: { organizationId: v.string(), projectId: v.id("projects"), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string(), slug: v.string(), icon: v.optional(v.string()), color: v.optional(v.string()) })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 50, 100);
    const spaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("projectId", args.projectId),
      )
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
