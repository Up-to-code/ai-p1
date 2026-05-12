import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { auditPartnerEvent, ensurePartnerProfile } from "./partnerRuntime";
import { createProgrammerTenantOrganization } from "./tenants";

export const ensureCurrentPartnerProfile = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    await ensurePartnerProfile(ctx);
    return { ok: true };
  },
});

export const createProgrammerOrganizationForCurrentPartner = mutationGeneric({
  args: {
    name: v.string(),
    countryCode: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const name = args.name.trim();
    const countryCode = args.countryCode.trim().toUpperCase();
    const existing = await ctx.db
      .query("partnerOrganizations")
      .withIndex("by_ownerAuthSubject", (q: any) => q.eq("ownerAuthSubject", identity.subject))
      .first();
    if (existing) {
      if (!existing.tenantOrganizationId) {
        const tenantOrganizationId = await createProgrammerTenantOrganization(ctx, {
          ownerAuthSubject: identity.subject,
          name: existing.name || name,
          countryCode: existing.countryCode || countryCode,
        });
        await ctx.db.patch(existing._id, {
          tenantOrganizationId,
          updatedAt: now,
        });
      }
      return { organizationId: existing._id };
    }
    const tenantOrganizationId = await createProgrammerTenantOrganization(ctx, {
      ownerAuthSubject: identity.subject,
      name,
      countryCode,
    });
    const organizationId = await ctx.db.insert("partnerOrganizations", {
      ownerAuthSubject: identity.subject,
      tenantOrganizationId,
      name,
      type: "programmer",
      countryCode,
      createdAt: now,
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      eventType: "partner_organization.created",
      payload: { organizationId, tenantOrganizationId, type: "programmer" },
      now,
    });
    return { organizationId };
  },
});
