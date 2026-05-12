import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { DEFAULT_AUTHORIZATION_EXPIRY_DAYS } from "../lib/partner-authorization";
import { assertPartnerAppEditable, auditPartnerEvent, ensurePartnerProfile, randomToken, requirePartnerIdentity } from "./partnerRuntime";
import { partnerAppClientTypeValidator } from "./schema";
import { assertPartnerOwnsApp, normalizeRedirectUris, normalizeScopes } from "./partnerAppPolicies";

async function requireOwnedApp(ctx: any, appId: string, authSubject: string) {
  const normalizedId = ctx.db.normalizeId("partnerApps", appId);
  const app = normalizedId ? await ctx.db.get(normalizedId) : null;
  assertPartnerOwnsApp(app, authSubject);
  return app;
}

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
    return apps
      .map((app: any) => ({
        id: app._id,
        clientId: app.clientId,
        name: app.name,
        publisherName: app.publisherName,
        homepageUrl: app.homepageUrl ?? null,
        iconUrl: app.iconUrl ?? app.logoUrl ?? null,
        logoUrl: app.logoUrl ?? null,
        clientType: app.clientType,
        status: app.status,
        hubPartnerAppId: app.hubPartnerAppId ?? null,
        hubOauthClientId: app.hubOauthClientId ?? null,
        hubSyncStatus: app.hubSyncStatus ?? "not_synced",
        hubSyncError: app.hubSyncError ?? null,
        redirectUris: app.redirectUris,
        allowedScopes: app.allowedScopes,
        authorizationExpiresAfterDays: app.authorizationExpiresAfterDays,
        reviewNotes: app.reviewNotes ?? null,
        submittedAt: app.submittedAt ?? null,
        reviewedAt: app.reviewedAt ?? null,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      }))
      .sort((left: any, right: any) => right.updatedAt - left.updatedAt);
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

export const submitPartnerAppForReview = mutationGeneric({
  args: { appId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const app = await requireOwnedApp(ctx, args.appId, identity.subject);
    assertPartnerAppEditable(app.status);
    await ctx.db.patch(app._id, {
      status: "pending_review",
      submittedAt: now,
      reviewNotes: undefined,
      hubSyncStatus: "pending",
      hubSyncError: undefined,
      updatedAt: now,
    });
    await ctx.db.insert("partnerAppReviews", {
      appId: app._id,
      status: "pending_review",
      createdAt: now,
    });
    await auditPartnerEvent(ctx, { actorAuthSubject: identity.subject, appId: app._id, eventType: "partner_app.submitted", now });
    return { ok: true };
  },
});

export const recordHubSyncResult = mutationGeneric({
  args: {
    appId: v.string(),
    ok: v.boolean(),
    hubPartnerAppId: v.optional(v.string()),
    hubOauthClientId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const app = await requireOwnedApp(ctx, args.appId, identity.subject);
    await ctx.db.patch(app._id, {
      hubPartnerAppId: args.hubPartnerAppId ?? app.hubPartnerAppId,
      hubOauthClientId: args.hubOauthClientId ?? app.hubOauthClientId,
      hubSyncStatus: args.ok ? "synced" : "failed",
      hubSyncError: args.ok ? undefined : args.error ?? "Hub sync failed.",
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      appId: app._id,
      eventType: args.ok ? "partner_app.hub_synced" : "partner_app.hub_sync_failed",
      payload: {
        hubPartnerAppId: args.hubPartnerAppId,
        hubOauthClientId: args.hubOauthClientId,
        error: args.error,
      },
      now,
    });
    return { ok: true };
  },
});

export const applyHubReviewDecision = mutationGeneric({
  args: {
    serviceToken: v.string(),
    appId: v.string(),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("suspended")),
    hubPartnerAppId: v.optional(v.string()),
    hubOauthClientId: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expected = process.env.PARTNERS_REVIEW_CALLBACK_TOKEN?.trim();
    if (!expected || args.serviceToken !== expected) {
      throw new Error("Invalid Partners review callback token.");
    }

    const normalizedId = ctx.db.normalizeId("partnerApps", args.appId);
    const app = normalizedId ? await ctx.db.get(normalizedId) : null;
    if (!app) throw new Error("Partner app not found.");

    const now = Date.now();
    const nextStatus = args.status === "approved" ? "active" : args.status;
    await ctx.db.patch(app._id, {
      status: nextStatus,
      hubPartnerAppId: args.hubPartnerAppId ?? app.hubPartnerAppId,
      hubOauthClientId: args.hubOauthClientId ?? app.hubOauthClientId,
      hubSyncStatus: "synced",
      hubSyncError: undefined,
      reviewNotes: args.reviewNotes,
      reviewedAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("partnerAppReviews", {
      appId: app._id,
      status: nextStatus,
      reviewerAuthSubject: "anan-hub",
      notes: args.reviewNotes,
      createdAt: now,
    });
    await auditPartnerEvent(ctx, {
      appId: app._id,
      eventType: "partner_app.hub_reviewed",
      payload: {
        status: args.status,
        hubPartnerAppId: args.hubPartnerAppId,
        hubOauthClientId: args.hubOauthClientId,
        hasClientSecret: Boolean(args.clientSecret),
      },
      now,
    });
    return { ok: true };
  },
});
