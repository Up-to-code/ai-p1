import { v } from "convex/values";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { resolveProjectAccess } from "../access/project";
import { resolveSpaceAccess } from "../access/space";
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
import { normalizeProjectVisibility, projectValidator } from "./validators";

const MAX_LIST_ITEMS = 300;
const MAX_SEARCH_SCAN_ITEMS = 500;
const MAX_STATS_SCAN_ITEMS = 2_000;

async function presentProject(ctx: QueryCtx, project: Doc<"projects">) {
  const media = await listResourceMedia(
    ctx,
    project.organizationId,
    "project",
    project._id,
  );
  const clean = stripDeletedFields(project);
  return {
    ...presentWorkspaceRecord(clean),
    visibility: normalizeProjectVisibility(project.visibility),
    coverImageUrl: selectCoverUrl(media),
  };
}

async function presentProjectListItem(ctx: QueryCtx, project: Doc<"projects">) {
  const media = await listResourceMedia(
    ctx,
    project.organizationId,
    "project",
    project._id,
  );
  const clean = stripDeletedFields(project);
  return {
    ...presentWorkspaceRecord(clean),
    visibility: normalizeProjectVisibility(project.visibility),
    coverImageUrl: selectCoverUrl(media),
  };
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .take(MAX_LIST_ITEMS);

    const readableProjects = access.filterReadable(
      activeUpdatedWorkspaceRows(projects),
    );
    return Promise.all(
      readableProjects.map((project) => presentProjectListItem(ctx, project)),
    );
  },
});

export const listPaged = query({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("planned"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
        v.literal("archived"),
      ),
    ),
    search: v.optional(v.string()),
  },
  returns: paginationResultValidator(projectValidator),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const search = args.search?.trim().toLowerCase();

    if (search) {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .order("desc")
        .take(MAX_SEARCH_SCAN_ITEMS);
      const matches = workspaceSearchRows(access.filterReadable(projects), {
        search,
        status: args.status,
        getStatus: (project) => project.status,
        searchValues: (project) => [
          project.name,
          project.description,
          project.currency,
        ],
      });

      return {
        page: await Promise.all(
          matches.map((project) => presentProjectListItem(ctx, project)),
        ),
        isDone: true,
        continueCursor: "",
      };
    }

    const page = await ctx.db
      .query("projects")
      .withIndex(
        args.status ? "by_organization_status" : "by_organization_updated",
        (q) =>
          args.status
            ? q
                .eq("organizationId", args.organizationId)
                .eq("status", args.status)
            : q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...page,
      page: await presentActiveWorkspacePage(
        access.filterReadable(page.page),
        (project) => presentProjectListItem(ctx, project),
      ),
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
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .take(MAX_STATS_SCAN_ITEMS);
    return projectStats(access.filterReadable(projects));
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string() })),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_updated", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .take(limit);

    return access
      .filterReadable(activeWorkspaceRows(projects))
      .map((project) => ({ id: project._id, name: project.name }));
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
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const client = await ctx.db.get(args.clientId);
    if (
      !client ||
      client.organizationId !== args.organizationId ||
      client.deletedAt
    )
      return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_client", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("clientId", args.clientId),
      )
      .take(limit);

    const readableProjects = access.filterReadable(
      activeUpdatedWorkspaceRows(projects),
    );
    return Promise.all(
      readableProjects.map((project) => presentProjectListItem(ctx, project)),
    );
  },
});

export const get = query({
  args: { organizationId: v.string(), projectId: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const project = await ctx.db.get(args.projectId);
    if (
      !project ||
      project.organizationId !== args.organizationId ||
      project.deletedAt ||
      project.recordState === "deleted"
    ) {
      return null;
    }

    access.assertCanRead(project);
    return presentProject(ctx, project);
  },
});

export const taskCounts = query({
  args: { organizationId: v.string() },
  returns: v.record(v.string(), v.number()),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .take(MAX_LIST_ITEMS);

    const counts: Record<string, number> = {};
    const readableProjects = access.filterReadable(
      activeUpdatedWorkspaceRows(projects),
    );
    for (const project of readableProjects) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_organization_project", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("projectId", project._id),
        )
        .take(500);
      counts[project._id] = tasks.filter((t) => !t.deletedAt).length;
    }
    return counts;
  },
});

export const listBySpace = query({
  args: {
    organizationId: v.string(),
    spaceId: v.id("spaces"),
    limit: v.optional(v.number()),
  },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    const [access, spaceAccess] = await Promise.all([
      resolveProjectAccess(ctx, args.organizationId),
      resolveSpaceAccess(ctx, args.organizationId),
    ]);
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const space = await ctx.db.get(args.spaceId);
    if (
      !space ||
      space.organizationId !== args.organizationId ||
      space.deletedAt ||
      space.recordState === "deleted"
    ) {
      return [];
    }
    spaceAccess.assertCanRead(space);

    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("spaceId", args.spaceId),
      )
      .take(limit);

    const projectIds = projectSpaces
      .filter((ps) => !ps.deletedAt && ps.recordState !== "deleted")
      .map((ps) => ps.projectId);

    const projects: Doc<"projects">[] = [];
    for (const projectId of projectIds) {
      const project = await ctx.db.get(projectId);
      if (
        project &&
        !project.deletedAt &&
        project.organizationId === args.organizationId
      ) {
        projects.push(project);
      }
    }

    return Promise.all(
      access
        .filterReadable(projects)
        .map((project) => presentProjectListItem(ctx, project)),
    );
  },
});

export const listAccessibleBySpaceMembership = query({
  args: {
    organizationId: v.string(),
    spaceIds: v.array(v.id("spaces")),
    limit: v.optional(v.number()),
  },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const actorSpaceIds = await access.filterActorSpaceIds(args.spaceIds);
    if (actorSpaceIds.length === 0) return [];

    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.or(
            ...actorSpaceIds.map((spaceId) =>
              q.eq(q.field("spaceId"), spaceId),
            ),
          ),
        ),
      )
      .take(limit);

    const projectIds = projectSpaces
      .filter((ps) => !ps.deletedAt && ps.recordState !== "deleted")
      .map((ps) => ps.projectId);

    const projects: Doc<"projects">[] = [];
    for (const projectId of projectIds) {
      const project = await ctx.db.get(projectId);
      if (
        project &&
        !project.deletedAt &&
        project.organizationId === args.organizationId
      ) {
        projects.push(project);
      }
    }

    return Promise.all(
      access
        .filterReadable(projects)
        .map((project) => presentProjectListItem(ctx, project)),
    );
  },
});
