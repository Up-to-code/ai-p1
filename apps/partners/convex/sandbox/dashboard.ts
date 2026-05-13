import { v } from "convex/values";
import { mutationGeneric, queryGeneric } from "convex/server";
import { auditPartnerEvent, requirePartnerIdentity } from "../partnerRuntime";
import { ensureSandboxOrganization, requireOwnedAppById } from "./db";
import { sandboxScopes } from "./types";

export const getSandboxForApp = queryGeneric({
  args: { appId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requirePartnerIdentity(ctx);
    const app = await requireOwnedAppById(ctx, args.appId, identity.subject);
    const organization = await ctx.db
      .query("sandboxOrganizations")
      .withIndex("by_partnerAppId", (q: any) => q.eq("partnerAppId", app._id))
      .first();
    const logs = await ctx.db
      .query("sandboxRequestLogs")
      .withIndex("by_partnerAppId", (q: any) => q.eq("partnerAppId", app._id))
      .take(50);

    return {
      organization: organization
        ? {
            id: organization._id,
            organizationId: organization.organizationId,
            name: organization.name,
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt,
          }
        : null,
      scopes: sandboxScopes,
      logs: logs.sort((left: any, right: any) => right.createdAt - left.createdAt),
    };
  },
});

export const ensureSandboxForApp = mutationGeneric({
  args: { appId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requirePartnerIdentity(ctx);
    const app = await requireOwnedAppById(ctx, args.appId, identity.subject);
    const organization = await ensureSandboxOrganization(ctx, app);
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      appId: app._id,
      eventType: "partner_sandbox.opened",
      now: Date.now(),
    });
    return {
      organizationId: organization.organizationId,
      name: organization.name,
      scopes: sandboxScopes,
    };
  },
});
