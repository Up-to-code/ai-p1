import { mutation } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { requireServerActor } from "../access/actor";
import { searchProjectionInputValidator, searchResourceTypeValidator } from "./validators";
import { writeSearchProjection } from "./projection";
import { v } from "convex/values";

export const rebuildProjection = mutation({
  args: { projection: searchProjectionInputValidator }, returns: v.null(),
  handler: async (ctx, { projection }) => {
    await assertOrganizationPermission(ctx, projection.organizationId, "update");
    await writeSearchProjection(ctx, projection);
    return null;
  },
});

export const updatePolicy = mutation({
  args: { organizationId: v.string(), enabledResourceTypes: v.array(searchResourceTypeValidator), attachmentExtractionEnabled: v.boolean(), ocrEnabled: v.boolean(), externallyIndexRestricted: v.boolean(), externallyIndexConfidential: v.boolean(), allowedMimeTypes: v.array(v.string()), defaultLocale: v.string(), fallbackLocales: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const actor = await requireServerActor(ctx);
    const existing = await ctx.db.query("searchPolicies").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId)).unique();
    const now = Date.now();
    const value = { ...args, enabledResourceTypes: [...new Set(args.enabledResourceTypes)], allowedMimeTypes: [...new Set(args.allowedMimeTypes)], fallbackLocales: [...new Set(args.fallbackLocales)], version: (existing?.version ?? 0) + 1, updatedByUserId: actor.userId, updatedAt: now };
    if (existing) await ctx.db.patch(existing._id, value); else await ctx.db.insert("searchPolicies", { ...value, createdAt: now });
    return null;
  },
});
