import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { listResourceMedia, selectCoverUrl } from "../media/data";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  activeUpdatedWorkspaceRows,
  activeWorkspaceRows,
  boundedWorkspaceReadLimit,
  presentActiveWorkspacePage,
  workspaceSearchRows,
} from "../workspace/readSurface";
import { propertyStats } from "../workspace/readStats";
import { propertyUnitValidator } from "./validators";

const MAX_LIST_ITEMS = 300;
const MAX_SEARCH_SCAN_ITEMS = 500;
const MAX_STATS_SCAN_ITEMS = 2_000;

async function presentProperty(ctx: QueryCtx, property: Doc<"propertyUnits">) {
  const media = await listResourceMedia(ctx, property.organizationId, "property", property._id);
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, ...safeProperty } = property;
  return {
    ...safeProperty,
    id: property._id,
    visibility: property.visibility ?? "private",
    coverImageUrl: selectCoverUrl(media),
  };
}

async function presentPropertyListItem(ctx: QueryCtx, property: Doc<"propertyUnits">) {
  const media = await listResourceMedia(ctx, property.organizationId, "property", property._id);
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, ...safeProperty } = property;
  return {
    ...safeProperty,
    id: property._id,
    visibility: property.visibility ?? "private",
    coverImageUrl: selectCoverUrl(media),
  };
}

async function findPropertyByIdOrReference(ctx: QueryCtx, organizationId: string, identifier: string) {
  const normalizedId = ctx.db.normalizeId("propertyUnits", identifier);
  const unitById = normalizedId ? await ctx.db.get(normalizedId) : null;
  if (unitById) return unitById;

  return ctx.db
    .query("propertyUnits")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .filter((q) => q.eq(q.field("reference"), identifier))
    .first();
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(propertyUnitValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const units = await ctx.db
      .query("propertyUnits")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_ITEMS);

    return Promise.all(activeUpdatedWorkspaceRows(units).map((unit) => presentPropertyListItem(ctx, unit)));
  },
});

export const listPaged = query({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(
      v.literal("available"),
      v.literal("sold"),
      v.literal("reserved"),
      v.literal("pending"),
      v.literal("draft"),
    )),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const search = args.search?.trim().toLowerCase();

    if (search) {
      const units = await ctx.db
        .query("propertyUnits")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(MAX_SEARCH_SCAN_ITEMS);
      const matches = workspaceSearchRows(units, {
        search,
        status: args.status,
        getStatus: (unit) => unit.status,
        searchValues: (unit) => [unit.title, unit.project, unit.city, unit.reference],
      });

      return {
        page: await Promise.all(matches.map((unit) => presentPropertyListItem(ctx, unit))),
        isDone: true,
        continueCursor: "",
      };
    }

    const page = await ctx.db
      .query("propertyUnits")
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
      page: await presentActiveWorkspacePage(page.page, (unit) => presentPropertyListItem(ctx, unit)),
    };
  },
});

export const stats = query({
  args: { organizationId: v.string() },
  returns: v.object({
    total: v.number(),
    available: v.number(),
    pending: v.number(),
    reserved: v.number(),
    sold: v.number(),
    draft: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const units = await ctx.db
      .query("propertyUnits")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_STATS_SCAN_ITEMS);
    return propertyStats(units);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), title: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const units = await ctx.db
      .query("propertyUnits")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return activeWorkspaceRows(units).map((unit) => ({ id: unit._id, title: unit.title }));
  },
});

export const listByProject = query({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  returns: v.array(propertyUnitValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== args.organizationId || project.deletedAt) return [];

    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const units = await ctx.db
      .query("propertyUnits")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .take(limit);

    return Promise.all(
      activeUpdatedWorkspaceRows(units.filter((unit) => unit.organizationId === args.organizationId)).map((unit) =>
        presentPropertyListItem(ctx, unit),
      ),
    );
  },
});

export const get = query({
  args: { organizationId: v.string(), propertyId: v.string() },
  returns: v.union(propertyUnitValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const unit = await findPropertyByIdOrReference(ctx, args.organizationId, args.propertyId.trim());
    if (!unit || unit.organizationId !== args.organizationId || unit.deletedAt) {
      return null;
    }

    return presentProperty(ctx, unit);
  },
});
