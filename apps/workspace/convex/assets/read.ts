import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
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
import { assetStats } from "../workspace/readStats";
import { assetValidator } from "./validators";

const MAX_LIST_ITEMS = 300;
const MAX_SEARCH_SCAN_ITEMS = 500;
const MAX_STATS_SCAN_ITEMS = 2_000;
const MAX_LINKED_PROJECT_ASSETS = 100;

function withoutDeleteFields<T extends { deletedAt?: number; isDeleted?: boolean }>(asset: T) {
  const safeAsset = { ...asset };
  delete safeAsset.deletedAt;
  delete safeAsset.isDeleted;
  return safeAsset;
}

async function presentAsset(ctx: QueryCtx, asset: Doc<"assets">) {
  const media = await listResourceMedia(ctx, asset.organizationId, "asset", asset._id);
  const safeAsset = withoutDeleteFields(asset);
  const coverImageUrl = selectCoverUrl(media) ?? asset.url ?? "";
  return {
    ...safeAsset,
    id: asset._id,
    visibility: asset.visibility ?? "private",
    coverImageUrl,
    image: coverImageUrl,
    title: asset.name,
    reference: asset._id,
    project: asset.project ?? asset.type,
    city: "",
    price: asset.status,
    area: asset.visibility ?? "private",
    bedrooms: 0,
    bathrooms: 0,
    purpose: "sale" as const,
  };
}

async function presentAssetListItem(ctx: QueryCtx, asset: Doc<"assets">) {
  const media = await listResourceMedia(ctx, asset.organizationId, "asset", asset._id);
  const safeAsset = withoutDeleteFields(asset);
  const coverImageUrl = selectCoverUrl(media) ?? asset.url ?? "";
  return {
    ...safeAsset,
    id: asset._id,
    visibility: asset.visibility ?? "private",
    coverImageUrl,
    image: coverImageUrl,
    title: asset.name,
    reference: asset._id,
    project: asset.project ?? asset.type,
    city: "",
    price: asset.status,
    area: asset.visibility ?? "private",
    bedrooms: 0,
    bathrooms: 0,
    purpose: "sale" as const,
  };
}

async function findAssetById(ctx: QueryCtx, organizationId: string, identifier: string) {
  const normalizedId = ctx.db.normalizeId("assets", identifier);
  const assetById = normalizedId ? await ctx.db.get(normalizedId) : null;
  if (assetById) return assetById;
  return null;
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(assetValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "read");
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_ITEMS);

    return Promise.all(activeUpdatedWorkspaceRows(assets).map((asset) => presentAssetListItem(ctx, asset)));
  },
});

export const listPaged = query({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(
      v.literal("available"),
      v.literal("pending"),
      v.literal("reserved"),
      v.literal("sold"),
      v.literal("draft"),
      v.literal("active"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("archived"),
    )),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "read");
    const search = args.search?.trim().toLowerCase();

    if (search) {
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(MAX_SEARCH_SCAN_ITEMS);
      const matches = workspaceSearchRows(assets, {
        search,
        status: args.status,
        getStatus: (asset) => asset.status,
        searchValues: (asset) => [asset.name, asset.type, asset.description],
      });

      return {
        page: await Promise.all(matches.map((asset) => presentAssetListItem(ctx, asset))),
        isDone: true,
        continueCursor: "",
      };
    }

    const page = await ctx.db
      .query("assets")
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
      page: await presentActiveWorkspacePage(page.page, (asset) => presentAssetListItem(ctx, asset)),
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
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "read");
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_STATS_SCAN_ITEMS);
    return assetStats(assets);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return activeWorkspaceRows(assets).map((asset) => ({ id: asset._id, name: asset.name }));
  },
});

export const listByProject = query({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  returns: v.array(assetValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "read");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== args.organizationId || project.deletedAt) return [];

    const limit = boundedWorkspaceReadLimit(args.limit, 50, MAX_LINKED_PROJECT_ASSETS);
    const links = await ctx.db
      .query("recordLinks")
      .withIndex("by_source", (q) =>
        q.eq("organizationId", args.organizationId).eq("sourceRecordType", "project").eq("sourceRecordId", args.projectId),
      )
      .take(limit);

    const assets = await Promise.all(links
      .filter((link) => !link.deletedAt && link.targetRecordType === "asset")
      .map(async (link) => {
        const asset = await ctx.db.get(link.targetRecordId as Id<"assets">);
        return asset && asset.organizationId === args.organizationId && !asset.deletedAt ? asset : null;
      }));

    return Promise.all(activeUpdatedWorkspaceRows(assets.filter((asset): asset is Doc<"assets"> => Boolean(asset)))
      .map((asset) => presentAssetListItem(ctx, asset)));
  },
});

export const get = query({
  args: { organizationId: v.string(), assetId: v.string() },
  returns: v.union(assetValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "read");
    const asset = await findAssetById(ctx, args.organizationId, args.assetId.trim());
    if (!asset || asset.organizationId !== args.organizationId || asset.deletedAt) {
      return null;
    }

    return presentAsset(ctx, asset);
  },
});
