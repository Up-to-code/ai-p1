import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { listResourceMedia, selectCoverUrl } from "../media/data";
import { presentWorkspaceRecord, stripDeletedFields } from "../shared/present";
import {
  activeUpdatedWorkspaceRows,
  activeWorkspaceRows,
  boundedWorkspaceReadLimit,
  presentActiveWorkspacePage,
  workspaceSearchRows,
} from "../workspace/readSurface";
import { projectStats } from "../workspace/readStats";
import { projectValidator } from "./validators";

const MAX_LIST_ITEMS = 300;
const MAX_SEARCH_SCAN_ITEMS = 500;
const MAX_STATS_SCAN_ITEMS = 2_000;

async function presentProject(ctx: QueryCtx, project: Doc<"projects">) {
  const media = await listResourceMedia(ctx, project.organizationId, "project", project._id);
  return {
    ...stripDeletedFields(project),
    ...presentWorkspaceRecord(project),
    visibility: project.visibility ?? "private",
    coverImageUrl: selectCoverUrl(media),
  };
}

async function presentProjectListItem(ctx: QueryCtx, project: Doc<"projects">) {
  const media = await listResourceMedia(ctx, project.organizationId, "project", project._id);
  return {
    ...stripDeletedFields(project),
    ...presentWorkspaceRecord(project),
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

    return Promise.all(activeUpdatedWorkspaceRows(projects).map((project) => presentProjectListItem(ctx, project)));
  },
});

export const listPaged = query({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(
      v.literal("planned"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("archived"),
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
      const matches = workspaceSearchRows(projects, {
        search,
        status: args.status,
        getStatus: (project) => project.status,
        searchValues: (project) => [project.name, project.description, project.currency],
      });

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
      page: await presentActiveWorkspacePage(page.page, (project) => presentProjectListItem(ctx, project)),
    };
  },
});

export const stats = query({
  args: { organizationId: v.string() },
  returns: v.object({
    total: v.number(),
    planned: v.number(),
    active: v.number(),
    paused: v.number(),
    completed: v.number(),
    archived: v.number(),
    onTrack: v.number(),
    atRisk: v.number(),
    blocked: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_STATS_SCAN_ITEMS);
    return projectStats(projects);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return activeWorkspaceRows(projects).map((project) => ({ id: project._id, name: project.name }));
  },
});

export const listByClient = query({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    limit: v.optional(v.number()),
  },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.organizationId !== args.organizationId || client.deletedAt) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", args.clientId))
      .take(limit);

    return Promise.all(activeUpdatedWorkspaceRows(projects).map((project) => presentProjectListItem(ctx, project)));
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

export const taskCounts = query({
  args: { organizationId: v.string() },
  returns: v.record(v.string(), v.number()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_ITEMS);

    const counts: Record<string, number> = {};
    for (const project of activeUpdatedWorkspaceRows(projects)) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_organization_project", (q) =>
          q.eq("organizationId", args.organizationId).eq("projectId", project._id),
        )
        .take(500);
      counts[project._id] = tasks.filter((t) => !t.deletedAt).length;
    }
    return counts;
  },
});
