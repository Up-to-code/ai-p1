import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
import { assertPlatformAdmin } from "../../platform/access";
import { assertOrganizationPermission } from "./access";
import { findOrganizationProfile } from "./data";
import {
  organizationProfileValidator,
  updateOrganizationProfileInputValidator,
} from "./validators";

export const updateProfileFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: updateOrganizationProfileInputValidator,
  },
  returns: organizationProfileValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertPlatformAdmin(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const now = Date.now();
    const existing = await findOrganizationProfile(ctx, args.organizationId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.input,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("organizations", {
        organizationId: args.organizationId,
        ...args.input,
        updatedAt: now,
      });
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "organization.profile.update",
      target: args.organizationId,
      summary: `Updated organization profile to ${args.input.name}.`,
      createdAt: now,
    });

    return {
      organizationId: args.organizationId,
      ...args.input,
      updatedAt: now,
    };
  },
});
