import { v } from "convex/values";
import { query } from "../../_generated/server";
import { assertOrganizationPermission } from "./access";
import { findOrganizationProfile } from "./data";
import {
  emptyOrganizationProfile,
  organizationProfileValidator,
} from "./validators";

export const getProfile = query({
  args: { organizationId: v.string() },
  returns: organizationProfileValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read").catch(() => undefined);

    const profile = await findOrganizationProfile(ctx, args.organizationId);

    if (profile) {
      return {
        organizationId: profile.organizationId,
        name: profile.name,
        legalName: profile.legalName,
        type: profile.type,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        address: profile.address,
        logo: profile.logo,
        brandColor: profile.brandColor,
        updatedAt: profile.updatedAt,
      };
    }

    return emptyOrganizationProfile(args.organizationId);
  },
});
