import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { authUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  hasPartnerScope,
  normalizePartnerScopes,
  scopeToPermission,
} from "@qentrah/partner-auth-core";
import {
  partnerActionValidator,
  partnerResourceValidator,
  updatePartnerConnectionInputValidator,
} from "./validators";

export const PARTNER_CONNECTION_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const PARTNER_CONNECTION_VERIFICATION_TTL_MS = 60 * 60 * 1000;

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

const partnerConnectionOutputValidator = v.object({
  _id: v.id("organizationPartnerConnections"),
  _creationTime: v.number(),
  id: v.id("organizationPartnerConnections"),
  organizationId: v.string(),
  partnersAppId: v.string(),
  partnersClientId: v.string(),
  status: v.union(v.literal("active"), v.literal("paused"), v.literal("revoked")),
  scopes: v.array(v.string()),
  authorizedByUserId: v.string(),
  authorizedMemberId: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  lastVerifiedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  revokedAt: v.optional(v.number()),
  effectiveStatus: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("revoked"),
    v.literal("expired"),
  ),
});

const partnerConnectionWithCatalogOutputValidator = v.object({
  ...partnerConnectionOutputValidator.fields,
  partnerApp: v.null(),
});

function presentConnection(connection: Doc<"organizationPartnerConnections">) {
  return {
    ...connection,
    id: connection._id,
    effectiveStatus: partnerConnectionEffectiveStatus(connection),
  };
}

function assertScopesAllowed(requestedScopes: string[], allowedScopes: string[]) {
  const allowed = new Set(allowedScopes);
  for (const scope of requestedScopes) {
    if (!allowed.has(scope)) {
      throw new Error(`Partner app is not allowed to request ${scope}.`);
    }
  }
}

export const authorizeConnectionFromHono = mutation({
  args: {
    organizationId: v.string(),
    partnersAppId: v.string(),
    partnersClientId: v.string(),
    scopes: v.array(v.string()),
    verifiedAt: v.number(),
  },
  returns: partnerConnectionOutputValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "authorize");

    const requestedScopes = normalizePartnerScopes(args.scopes);
    if (requestedScopes.length === 0) throw new Error("At least one valid partner scope is required.");
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
        q.eq("organizationId", args.organizationId).eq("partnersAppId", args.partnersAppId),
      )
      .unique();

    const connectionPatch = {
      partnersAppId: args.partnersAppId,
      partnersClientId: args.partnersClientId,
      scopes: requestedScopes,
      status: "active" as const,
      authorizedByUserId: user._id,
      authorizedMemberId: user._id,
      expiresAt: partnerConnectionExpiresAt(now),
      lastVerifiedAt: args.verifiedAt,
      updatedAt: now,
      revokedAt: undefined,
    };

    const connectionId = existing?._id ??
      await ctx.db.insert("organizationPartnerConnections", {
        organizationId: args.organizationId,
        createdAt: now,
        ...connectionPatch,
      });

    if (existing) await ctx.db.patch(existing._id, connectionPatch);

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "partnerApp.authorize",
      target: args.partnersAppId,
      summary: `Authorized partner app ${args.partnersAppId}.`,
      createdAt: now,
    });

    return presentConnection((await ctx.db.get(connectionId))!);
  },
});

export const listConnections = query({
  args: { organizationId: v.string() },
  returns: v.array(partnerConnectionWithCatalogOutputValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "read");
    const connections = await ctx.db
      .query("organizationPartnerConnections")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(200);

    return connections.map((connection) => ({
      ...presentConnection(connection),
      partnerApp: null,
    }));
  },
});

export const updateConnectionFromHono = mutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationPartnerConnections"),
    input: updatePartnerConnectionInputValidator,
    verifiedAt: v.optional(v.number()),
  },
  returns: partnerConnectionOutputValidator,
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "oauthApp", "update");
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.organizationId !== args.organizationId || connection.status === "revoked") {
      throw new Error("Partner connection was not found.");
    }

    await ctx.db.patch(args.connectionId, {
      status: args.input.status,
      lastVerifiedAt: args.verifiedAt ?? connection.lastVerifiedAt,
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
    partnersClientId: v.string(),
    scopes: v.array(v.string()),
    resource: partnerResourceValidator,
    action: partnerActionValidator,
  },
  returns: v.object({
    ok: v.boolean(),
    reason: v.optional(v.string()),
    partnerAppId: v.optional(v.string()),
    connectionId: v.optional(v.id("organizationPartnerConnections")),
    scopes: v.optional(v.array(v.string())),
    appName: v.optional(v.string()),
    verificationRequired: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("organizationPartnerConnections")
      .withIndex("by_client_organization", (q) =>
        q.eq("partnersClientId", args.partnersClientId).eq("organizationId", args.organizationId),
      )
      .unique();
    if (!connection) return { ok: false, reason: "connection_not_found" };
    if (connection.status !== "active") return { ok: false, reason: connection.status };
    if (connection.expiresAt && connection.expiresAt <= Date.now()) return { ok: false, reason: "connection_expired" };

    const tokenScopes = normalizePartnerScopes(args.scopes);
    assertScopesAllowed(tokenScopes, connection.scopes);
    const effectiveScopes = tokenScopes.filter((scope) => connection.scopes.includes(scope));
    if (!hasPartnerScope(effectiveScopes, args.resource, args.action)) {
      return { ok: false, reason: "scope_denied" };
    }

    const verificationRequired = !connection.lastVerifiedAt ||
      Date.now() - connection.lastVerifiedAt > PARTNER_CONNECTION_VERIFICATION_TTL_MS;

    return {
      ok: true,
      partnerAppId: connection.partnersAppId,
      connectionId: connection._id,
      scopes: effectiveScopes,
      appName: connection.partnersAppId,
      verificationRequired,
    };
  },
});
