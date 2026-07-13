import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUser } from "../../auth";
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
    const user = await getAuthUser(ctx);
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

export const ensureProfileFromHono = mutation({
  args: {
    organizationId: v.string(),
    name: v.optional(v.string()),
    actorUserId: v.optional(v.string()),
  },
  returns: organizationProfileValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const existing = await findOrganizationProfile(ctx, args.organizationId);
    if (existing) {
      return {
        organizationId: existing.organizationId,
        name: existing.name,
        legalName: existing.legalName,
        type: existing.type,
        email: existing.email,
        phone: existing.phone,
        website: existing.website,
        address: existing.address,
        logo: existing.logo,
        brandColor: existing.brandColor,
        updatedAt: existing.updatedAt,
      };
    }

    const now = Date.now();
    const profile = {
      organizationId: args.organizationId,
      name: args.name?.trim() || "Organization",
      legalName: "",
      type: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      logo: undefined,
      brandColor: undefined,
      updatedAt: now,
    };

    await ctx.db.insert("organizations", profile);

    const actorUserId = args.actorUserId ?? user._id;
    if (actorUserId) {
      await ctx.db.insert("organizationAuditEvents", {
        organizationId: args.organizationId,
        actorUserId,
        action: "organization.profile.ensure",
        target: args.organizationId,
        summary: "Created missing organization profile shell.",
        createdAt: now,
      });
    }

    return profile;
  },
});
