import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { DEFAULT_AUTHORIZATION_EXPIRY_DAYS } from "../../lib/partner-authorization";
import { assertPartnerAppEditable, auditPartnerEvent, ensurePartnerProfile, randomToken, requirePartnerIdentity } from "../shared/runtime";
import { partnerAppClientTypeValidator } from "../schema";
import { normalizeRedirectUris, normalizeScopes } from "../shared/appPolicies";
import { requireOwnedApp } from "./db";
import { presentPartnerApp } from "./presenter";

export const createPartnerApp = mutationGeneric({
  args: {
    name: v.string(),
    publisherName: v.string(),
    homepageUrl: v.string(),
    iconUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    clientType: partnerAppClientTypeValidator,
    redirectUris: v.array(v.string()),
    allowedScopes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const partnerOrganization = await ctx.db
      .query("partnerOrganizations")
      .withIndex("by_ownerAuthSubject", (q: any) => q.eq("ownerAuthSubject", identity.subject))
      .first();
    const clientId = randomToken("partners_client", 18);
    const clientSecret = args.clientType === "confidential" ? randomToken("partners_secret", 32) : undefined;
    const appId = await ctx.db.insert("partnerApps", {
      partnerAuthSubject: identity.subject,
      partnerOrganizationId: partnerOrganization?._id,
      clientId,
      clientSecretHash: clientSecret,
      name: args.name.trim(),
      publisherName: args.publisherName.trim(),
      homepageUrl: args.homepageUrl.trim(),
      iconUrl: args.iconUrl?.trim() || undefined,
      logoUrl: args.logoUrl?.trim() || undefined,
      clientType: args.clientType,
      redirectUris: normalizeRedirectUris(args.redirectUris),
      allowedScopes: normalizeScopes(args.allowedScopes),
      status: "draft",
      hubSyncStatus: "not_synced",
      authorizationExpiresAfterDays: DEFAULT_AUTHORIZATION_EXPIRY_DAYS,
      createdAt: now,
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      appId,
      eventType: "partner_app.created",
      payload: { clientId, clientType: args.clientType },
      now,
    });
    return { appId, clientId, clientSecret };
  },
});

export const listPartnerApps = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const identity = await requirePartnerIdentity(ctx);
    const apps = await ctx.db
      .query("partnerApps")
      .withIndex("by_partnerAuthSubject", (q: any) => q.eq("partnerAuthSubject", identity.subject))
      .collect();
    return apps.map(presentPartnerApp).sort((left: any, right: any) => right.updatedAt - left.updatedAt);
  },
});

export const updatePartnerApp = mutationGeneric({
  args: {
    appId: v.string(),
    name: v.string(),
    publisherName: v.string(),
    homepageUrl: v.string(),
    iconUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    redirectUris: v.array(v.string()),
    allowedScopes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const app = await requireOwnedApp(ctx, args.appId, identity.subject);
    assertPartnerAppEditable(app.status);
    await ctx.db.patch(app._id, {
      name: args.name.trim(),
      publisherName: args.publisherName.trim(),
      homepageUrl: args.homepageUrl.trim(),
      iconUrl: args.iconUrl?.trim() || undefined,
      logoUrl: args.logoUrl?.trim() || undefined,
      redirectUris: normalizeRedirectUris(args.redirectUris),
      allowedScopes: normalizeScopes(args.allowedScopes),
      status: app.status === "rejected" ? "draft" : app.status,
      reviewNotes: undefined,
      hubSyncStatus: "not_synced",
      hubSyncError: undefined,
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, { actorAuthSubject: identity.subject, appId: app._id, eventType: "partner_app.updated", now });
    return { ok: true };
  },
});
