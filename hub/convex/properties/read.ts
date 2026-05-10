import { v } from "convex/values";
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
