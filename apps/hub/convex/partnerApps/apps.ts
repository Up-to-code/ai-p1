import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { assertPlatformAdmin } from "../platform/access";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  hasPartnerScope,
  normalizeScopes,
  scopeToPermission,
} from "../../src/packages/partner-apps/scopes";
import {
  partnerActionValidator,
  partnerAppInputValidator,
  partnerResourceValidator,
  partnerReviewInputValidator,
  updatePartnerConnectionInputValidator,
} from "./validators";

export const PARTNER_CONNECTION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export function partnerConnectionExpiresAt(now: number) {
  return now + PARTNER_CONNECTION_TTL_MS;
}

export function partnerConnectionEffectiveStatus(
  connection: Pick<Doc<"organizationPartnerConnections">, "status" | "expiresAt">,
  now = Date.now(),
) {
  if (connection.status === "active" && connection.expiresAt && connection.expiresAt <= now) {
    return "expired" as const;
  }
  return connection.status;
}

function presentPartnerApp(app: Doc<"partnerApps">) {
  return { ...app, id: app._id };
}

function presentConnection(connection: Doc<"organizationPartnerConnections">) {
  return { ...connection, id: connection._id, effectiveStatus: partnerConnectionEffectiveStatus(connection) };
}

async function findPartnerAppByClientId(
  ctx: QueryCtx | MutationCtx,
  oauthClientId: string,
) {
  return await ctx.db
    .query("partnerApps")
    .withIndex("by_oauth_client_id", (q) => q.eq("oauthClientId", oauthClientId))
    .unique();
}

function assertScopesAllowed(requestedScopes: string[], allowedScopes: string[]) {
  const allowed = new Set(allowedScopes);
  for (const scope of requestedScopes) {
    if (!allowed.has(scope)) {
      throw new Error(`Partner app is not allowed to request ${scope}.`);
    }
  }
}

export const createFromHono = mutation({
  args: { input: partnerAppInputValidator },
  returns: v.any(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const now = Date.now();
    const allowedScopes = normalizeScopes(args.input.allowedScopes);
    if (allowedScopes.length === 0) throw new Error("At least one valid scope is required.");

    const existing = await findPartnerAppByClientId(ctx, args.input.oauthClientId);
    if (existing) throw new Error("Partner app already exists for this OAuth client.");

    const appId = await ctx.db.insert("partnerApps", {
      ownerUserId: user._id,
      oauthClientId: args.input.oauthClientId,
      name: args.input.name,
      description: args.input.description,
      homepageUrl: args.input.homepageUrl,
      logoUrl: args.input.logoUrl,
      redirectUris: args.input.redirectUris,
      allowedScopes,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return presentPartnerApp((await ctx.db.get(appId))!);
  },
});

export const upsertFromPartnersService = mutation({
  args: {
    input: v.object({
      partnersAppId: v.string(),
      partnersClientId: v.string(),
      name: v.string(),
      publisherName: v.string(),
      description: v.string(),
      homepageUrl: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      redirectUris: v.array(v.string()),
      allowedScopes: v.array(v.string()),
      clientType: v.union(v.literal("public"), v.literal("confidential")),
      callbackUrl: v.optional(v.string()),
    }),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const allowedScopes = normalizeScopes(args.input.allowedScopes);
    if (allowedScopes.length === 0) throw new Error("At least one valid scope is required.");

    const existing = await ctx.db
      .query("partnerApps")
      .withIndex("by_partners_app_id", (q) => q.eq("partnersAppId", args.input.partnersAppId))
      .unique();

    const patch = {
      ownerUserId: `partners:${args.input.publisherName}`,
      partnersAppId: args.input.partnersAppId,
      partnersClientId: args.input.partnersClientId,
      publisherName: args.input.publisherName,
      oauthClientId: existing?.oauthClientId ?? args.input.partnersClientId,
      clientType: args.input.clientType,
      callbackUrl: args.input.callbackUrl,
      name: args.input.name,
      description: args.input.description,
      homepageUrl: args.input.homepageUrl,
      logoUrl: args.input.logoUrl,
      redirectUris: args.input.redirectUris,
      allowedScopes,
      status: existing?.status === "approved" ? "approved" as const : "pending" as const,
      updatedAt: now,
    };

    const appId = existing?._id ??
      await ctx.db.insert("partnerApps", {
        ...patch,
        createdAt: now,
      });

    if (existing) await ctx.db.patch(existing._id, patch);
    return presentPartnerApp((await ctx.db.get(appId))!);
  },
});

export const listForAdminService = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const apps = await ctx.db.query("partnerApps").take(500);
    return apps.sort((a, b) => b.updatedAt - a.updatedAt).map(presentPartnerApp);
  },
});

export const listApprovedCatalog = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const apps = await ctx.db
      .query("partnerApps")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .take(200);
    return apps.sort((a, b) => b.updatedAt - a.updatedAt).map(presentPartnerApp);
  },
});

export const reviewFromAdminService = mutation({
  args: {
    appId: v.id("partnerApps"),
    input: partnerReviewInputValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.appId);
    if (!app) throw new Error("Partner app was not found.");

    const now = Date.now();
    await ctx.db.patch(args.appId, {
      status: args.input.status,
      reviewNotes: args.input.reviewNotes,
      reviewedByUserId: "service:admin",
      reviewedAt: now,
      updatedAt: now,
    });

    return presentPartnerApp((await ctx.db.get(args.appId))!);
  },
});

export const listForCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const ownApps = await ctx.db
      .query("partnerApps")
      .withIndex("by_owner_user_id", (q) => q.eq("ownerUserId", user._id))
      .take(200);

    return ownApps.sort((a, b) => b.updatedAt - a.updatedAt).map(presentPartnerApp);
  },
});

export const listForPlatformReview = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await assertPlatformAdmin(ctx);
    const apps = await ctx.db.query("partnerApps").take(500);
    return apps.sort((a, b) => b.updatedAt - a.updatedAt).map(presentPartnerApp);
  },
});

export const reviewFromHono = mutation({
  args: { appId: v.id("partnerApps"), input: partnerReviewInputValidator },
  returns: v.any(),
  handler: async (ctx, args) => {
    const reviewer = await assertPlatformAdmin(ctx);
    const app = await ctx.db.get(args.appId);
    if (!app) throw new Error("Partner app was not found.");

    const now = Date.now();
    await ctx.db.patch(args.appId, {
      status: args.input.status,
      reviewNotes: args.input.reviewNotes,
      reviewedByUserId: reviewer._id,
      reviewedAt: now,
      updatedAt: now,
    });

    return presentPartnerApp((await ctx.db.get(args.appId))!);
  },
});

export const authorizeConnectionFromHono = mutation({
  args: {
    organizationId: v.string(),
    oauthClientId: v.string(),
    scopes: v.array(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "authorize");

    const app = await findPartnerAppByClientId(ctx, args.oauthClientId);
    if (!app || app.status !== "approved") throw new Error("Partner app is not approved.");

    const requestedScopes = normalizeScopes(args.scopes);
    assertScopesAllowed(requestedScopes, app.allowedScopes);
    for (const scope of requestedScopes) {
      const permission = scopeToPermission(scope);
      if (!permission) continue;
      await assertOrganizationResourcePermission(
        ctx,
        args.organizationId,
        permission.resource,
        permission.action,
      );
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("organizationPartnerConnections")
      .withIndex("by_organization_app", (q) =>
        q.eq("organizationId", args.organizationId).eq("partnerAppId", app._id),
      )
      .unique();

    const connectionPatch = {
      oauthClientId: args.oauthClientId,
      scopes: requestedScopes,
      status: "active" as const,
      authorizedByUserId: user._id,
      expiresAt: partnerConnectionExpiresAt(now),
      updatedAt: now,
      revokedAt: undefined,
    };

    const connectionId = existing?._id ??
      await ctx.db.insert("organizationPartnerConnections", {
        organizationId: args.organizationId,
        partnerAppId: app._id,
        createdAt: now,
        ...connectionPatch,
      });

    if (existing) await ctx.db.patch(existing._id, connectionPatch);

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "partnerApp.authorize",
      target: app._id,
      summary: `Authorized partner app ${app.name}.`,
      createdAt: now,
    });

    return presentConnection((await ctx.db.get(connectionId))!);
  },
});

export const listConnections = query({
  args: { organizationId: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "read");
    const connections = await ctx.db
      .query("organizationPartnerConnections")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(200);

    const apps = await Promise.all(connections.map((connection) => ctx.db.get(connection.partnerAppId)));
    return connections.map((connection, index) => ({
      ...presentConnection(connection),
      partnerApp: apps[index] ? presentPartnerApp(apps[index]) : null,
    }));
  },
});

export const updateConnectionFromHono = mutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationPartnerConnections"),
    input: updatePartnerConnectionInputValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "update");
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.organizationId !== args.organizationId || connection.status === "revoked") {
      throw new Error("Partner connection was not found.");
    }

    await ctx.db.patch(args.connectionId, {
      status: args.input.status,
      updatedAt: Date.now(),
    });
    return presentConnection((await ctx.db.get(args.connectionId))!);
  },
});

export const revokeConnectionFromHono = mutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationPartnerConnections"),
  },
  returns: v.object({ revoked: v.boolean() }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "delete");
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.organizationId !== args.organizationId) {
      throw new Error("Partner connection was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.connectionId, {
      status: "revoked",
      revokedAt: now,
      updatedAt: now,
    });
    return { revoked: true };
  },
});

export const validateAccess = query({
  args: {
    organizationId: v.string(),
    oauthClientId: v.string(),
    scopes: v.array(v.string()),
    resource: partnerResourceValidator,
    action: partnerActionValidator,
  },
  returns: v.object({
    ok: v.boolean(),
    reason: v.optional(v.string()),
    partnerAppId: v.optional(v.id("partnerApps")),
    connectionId: v.optional(v.id("organizationPartnerConnections")),
    scopes: v.optional(v.array(v.string())),
    appName: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const app = await findPartnerAppByClientId(ctx, args.oauthClientId);
    if (!app) return { ok: false, reason: "app_not_found" };
    if (app.status !== "approved") return { ok: false, reason: "app_not_approved" };

    const connection = await ctx.db
      .query("organizationPartnerConnections")
      .withIndex("by_oauth_client_organization", (q) =>
        q.eq("oauthClientId", args.oauthClientId).eq("organizationId", args.organizationId),
      )
      .unique();
    if (!connection) return { ok: false, reason: "connection_not_found" };
    if (connection.status !== "active") return { ok: false, reason: connection.status };
    if (connection.expiresAt && connection.expiresAt <= Date.now()) return { ok: false, reason: "connection_expired" };

    const tokenScopes = normalizeScopes(args.scopes);
    const effectiveScopes = tokenScopes.filter((scope) => connection.scopes.includes(scope));
    if (!hasPartnerScope(effectiveScopes, args.resource, args.action)) {
      return { ok: false, reason: "scope_denied" };
    }

    return {
      ok: true,
      partnerAppId: app._id,
      connectionId: connection._id,
      scopes: effectiveScopes,
      appName: app.name,
    };
  },
});
