import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";

const stageValidator = v.union(v.literal("disabled"), v.literal("preview"), v.literal("canonical"));

export const getAgencyOs = query({
  args: { organizationId: v.string() }, returns: v.object({ stage: stageValidator, version: v.number() }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const row = await ctx.db.query("organizationPlatformRollouts").withIndex("by_organization_feature", (q) => q.eq("organizationId", args.organizationId).eq("featureKey", "agency_os")).unique();
    return { stage: row?.stage ?? "canonical", version: row?.version ?? 1 };
  },
});

export const setAgencyOs = mutation({
  args: { organizationId: v.string(), stage: stageValidator }, returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update"); const actor = await requireServerActor(ctx), now = Date.now();
    const row = await ctx.db.query("organizationPlatformRollouts").withIndex("by_organization_feature", (q) => q.eq("organizationId", args.organizationId).eq("featureKey", "agency_os")).unique();
    if (row) await ctx.db.patch(row._id, { stage: args.stage, version: row.version + 1, updatedByUserId: actor.userId, updatedAt: now });
    else await ctx.db.insert("organizationPlatformRollouts", { organizationId: args.organizationId, featureKey: "agency_os", stage: args.stage, version: 1, updatedByUserId: actor.userId, createdAt: now, updatedAt: now });
    return null;
  },
});
