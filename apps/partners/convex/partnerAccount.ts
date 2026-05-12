import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { auditPartnerEvent, ensurePartnerProfile, requirePartnerIdentity } from "./partnerRuntime";

async function getCurrentProgrammerOrganization(ctx: any, authSubject: string) {
  return ctx.db
    .query("partnerOrganizations")
    .withIndex("by_ownerAuthSubject", (q: any) => q.eq("ownerAuthSubject", authSubject))
    .first();
}

export const getCurrentPartnerAccount = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const identity = await requirePartnerIdentity(ctx);
    const profile = await ctx.db
      .query("partnerProfiles")
      .withIndex("by_authSubject", (q: any) => q.eq("authSubject", identity.subject))
      .first();
    const organization = await getCurrentProgrammerOrganization(ctx, identity.subject);

    return {
      identity,
      profile: profile
        ? {
            id: profile._id,
            authSubject: profile.authSubject,
            name: profile.name ?? null,
            email: profile.email ?? identity.email ?? null,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        : null,
      organization: organization
        ? {
            id: organization._id,
            ownerAuthSubject: organization.ownerAuthSubject,
            tenantOrganizationId: organization.tenantOrganizationId ?? null,
            name: organization.name,
            type: organization.type,
            countryCode: organization.countryCode,
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt,
          }
        : null,
    };
  },
});

export const updateCurrentPartnerProfile = mutationGeneric({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity, profileId } = await ensurePartnerProfile(ctx, now);
    const name = args.name.trim();
    await ctx.db.patch(profileId, {
      name,
      email: identity.email,
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      eventType: "partner_profile.updated",
      payload: { fields: ["name"] },
      now,
    });
    return { ok: true };
  },
});

export const updateCurrentProgrammerOrganization = mutationGeneric({
  args: {
    name: v.string(),
    countryCode: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const organization = await getCurrentProgrammerOrganization(ctx, identity.subject);
    if (!organization) {
      throw new Error("PROGRAMMER_ORGANIZATION_REQUIRED");
    }
    const countryCode = args.countryCode.trim().toUpperCase();
    await ctx.db.patch(organization._id, {
      name: args.name.trim(),
      countryCode,
      type: "programmer",
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      eventType: "partner_organization.updated",
      payload: { organizationId: organization._id, type: "programmer" },
      now,
    });
    return { ok: true };
  },
});
