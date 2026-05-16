import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { listResourceMedia, selectCoverUrl } from "../media/data";
import { projectValidator } from "./validators";

const MAX_LIST_ITEMS = 300;
const MAX_SEARCH_SCAN_ITEMS = 500;
const MAX_STATS_SCAN_ITEMS = 2_000;

async function presentProject(ctx: QueryCtx, project: Doc<"projects">) {
  const media = await listResourceMedia(ctx, project.organizationId, "project", project._id);
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, ...safeProject } = project;
  return {
    ...safeProject,
    id: project._id,
    visibility: project.visibility ?? "private",
    coverImageUrl: selectCoverUrl(media),
  };
}

async function presentProjectListItem(ctx: QueryCtx, project: Doc<"projects">) {
  const media = await listResourceMedia(ctx, project.organizationId, "project", project._id);
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, ...safeProject } = project;
  return {
    ...safeProject,
    id: project._id,
    visibility: project.visibility ?? "private",
    coverImageUrl: selectCoverUrl(media),
  };
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_ITEMS);

    const active = projects
      .filter((project) => !project.deletedAt)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return Promise.all(active.map((project) => presentProjectListItem(ctx, project)));
  },
});

export const listPaged = query({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    )),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const search = args.search?.trim().toLowerCase();

    if (search) {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(MAX_SEARCH_SCAN_ITEMS);
      const matches = projects
        .filter((project) => !project.deletedAt)
        .filter((project) => !args.status || project.status === args.status)
        .filter((project) => [project.name, project.reference, project.city, project.developer].some((value) => value.toLowerCase().includes(search)))
        .slice(0, 100);

      return {
        page: await Promise.all(matches.map((project) => presentProjectListItem(ctx, project))),
        isDone: true,
        continueCursor: "",
      };
    }

    const page = await ctx.db
      .query("projects")
      .withIndex(
        args.status ? "by_organization_status" : "by_organization_updated",
        (q) => args.status
          ? q.eq("organizationId", args.organizationId).eq("status", args.status)
          : q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...page,
      page: await Promise.all(page.page
        .filter((project) => !project.deletedAt)
        .map((project) => presentProjectListItem(ctx, project))),
    };
  },
});

export const stats = query({
  args: { organizationId: v.string() },
  returns: v.object({
    total: v.number(),
    approved: v.number(),
    pending: v.number(),
    draft: v.number(),
    rejected: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_STATS_SCAN_ITEMS);
    const active = projects.filter((project) => !project.deletedAt);

    return {
      total: active.length,
      approved: active.filter((project) => project.status === "approved").length,
      pending: active.filter((project) => project.status === "pending").length,
      draft: active.filter((project) => project.status === "draft").length,
      rejected: active.filter((project) => project.status === "rejected").length,
    };
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return projects
      .filter((project) => !project.deletedAt)
      .map((project) => ({ id: project._id, name: project.name }));
  },
});

export const get = query({
  args: { organizationId: v.string(), projectId: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== args.organizationId || project.deletedAt) {
      return null;
    }

    return presentProject(ctx, project);
  },
});
