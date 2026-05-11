import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { listResourceMedia, selectCoverUrl } from "../media/data";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { propertyUnitValidator } from "./validators";

async function presentProperty(ctx: QueryCtx, property: Doc<"propertyUnits">) {
  const media = await listResourceMedia(ctx, property.organizationId, "property", property._id);
  return {
    ...property,
    id: property._id,
    coverImageUrl: selectCoverUrl(media),
  };
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(propertyUnitValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const units = await ctx.db
      .query("propertyUnits")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const active = units
      .filter((unit) => !unit.deletedAt)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return Promise.all(active.map((unit) => presentProperty(ctx, unit)));
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
        .collect();
      const matches = units
        .filter((unit) => !unit.deletedAt)
        .filter((unit) => !args.status || unit.status === args.status)
        .filter((unit) => [unit.title, unit.project, unit.city, unit.reference].some((value) => value.toLowerCase().includes(search)))
        .slice(0, 100);

      return {
        page: await Promise.all(matches.map((unit) => presentProperty(ctx, unit))),
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
      page: await Promise.all(
        page.page
          .filter((unit) => !unit.deletedAt)
          .map((unit) => presentProperty(ctx, unit)),
      ),
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
      .collect();
    const active = units.filter((unit) => !unit.deletedAt);

    return {
      total: active.length,
      available: active.filter((unit) => unit.status === "available").length,
      pending: active.filter((unit) => unit.status === "pending").length,
      reserved: active.filter((unit) => unit.status === "reserved").length,
      sold: active.filter((unit) => unit.status === "sold").length,
      draft: active.filter((unit) => unit.status === "draft").length,
    };
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), title: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));
    const units = await ctx.db
      .query("propertyUnits")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return units
      .filter((unit) => !unit.deletedAt)
      .map((unit) => ({ id: unit._id, title: unit.title }));
  },
});

export const get = query({
  args: { organizationId: v.string(), propertyId: v.id("propertyUnits") },
  returns: v.union(propertyUnitValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "read");
    const unit = await ctx.db.get(args.propertyId);
    if (!unit || unit.organizationId !== args.organizationId || unit.deletedAt) {
      return null;
    }

    return presentProperty(ctx, unit);
  },
});
