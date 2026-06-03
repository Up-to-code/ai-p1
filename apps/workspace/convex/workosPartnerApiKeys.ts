import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";
import { hasPartnerScope, normalizePartnerScopes } from "@qentrah/partner-auth-core";
import {
  partnerActionValidator,
  partnerResourceValidator,
} from "./partnerApps/validators";

export const recordIssued = mutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationPartnerConnections"),
    partnerId: v.string(),
    partnerClientId: v.string(),
    workosApiKeyId: v.string(),
    workosOwnerOrganizationId: v.string(),
    keyLast4: v.string(),
    name: v.string(),
    permissions: v.array(v.string()),
    expiresAt: v.optional(v.number()),
  },
  returns: v.object({ id: v.id("workosPartnerApiKeys") }),
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.organizationId !== args.organizationId || connection.status !== "active") {
      throw new Error("Active organization partner connection is required.");
    }

    const user = await authComponent.getAuthUser(ctx);
    const now = Date.now();
    const permissions = normalizePartnerScopes(args.permissions);
    const id = await ctx.db.insert("workosPartnerApiKeys", {
      organizationId: args.organizationId,
      connectionId: args.connectionId,
      partnerId: args.partnerId,
      partnerClientId: args.partnerClientId,
      partnersAppId: connection.partnersAppId,
      partnersClientId: connection.partnersClientId,
      workosApiKeyId: args.workosApiKeyId,
      workosOwnerOrganizationId: args.workosOwnerOrganizationId,
      keyLast4: args.keyLast4,
      name: args.name,
      permissions,
      status: "active",
      expiresAt: args.expiresAt,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "partnerApiKey.create",
      target: id,
      summary: `Created WorkOS partner API key ${args.name}.`,
      createdAt: now,
    });

    return { id };
  },
});

export const validateGrant = mutation({
  args: {
    organizationId: v.string(),
    workosApiKeyId: v.string(),
    workosOwnerOrganizationId: v.string(),
    permissions: v.array(v.string()),
    resource: partnerResourceValidator,
    action: partnerActionValidator,
  },
  returns: v.object({
    ok: v.boolean(),
    reason: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    partnerId: v.optional(v.string()),
    partnerClientId: v.optional(v.string()),
    partnersAppId: v.optional(v.string()),
    partnersClientId: v.optional(v.string()),
    connectionId: v.optional(v.id("organizationPartnerConnections")),
    apiKeyId: v.optional(v.id("workosPartnerApiKeys")),
    permissions: v.optional(v.array(v.string())),
    name: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const key = await ctx.db
      .query("workosPartnerApiKeys")
      .withIndex("by_workos_api_key_id", (q) => q.eq("workosApiKeyId", args.workosApiKeyId))
      .unique();
    if (!key) return { ok: false, reason: "grant_not_found" };
    if (key.organizationId !== args.organizationId) return { ok: false, reason: "organization_mismatch" };
    if (key.workosOwnerOrganizationId !== args.workosOwnerOrganizationId) return { ok: false, reason: "owner_mismatch" };
    if (key.status !== "active") return { ok: false, reason: key.status };
    if (key.expiresAt && key.expiresAt <= Date.now()) return { ok: false, reason: "expired" };

    const connection = await ctx.db.get(key.connectionId);
    if (!connection || connection.status !== "active") return { ok: false, reason: "connection_inactive" };
    if (connection.expiresAt && connection.expiresAt <= Date.now()) return { ok: false, reason: "connection_expired" };

    const workosPermissions = normalizePartnerScopes(args.permissions);
    const grantPermissions = normalizePartnerScopes(key.permissions);
    const effectivePermissions = workosPermissions.filter((permission) => grantPermissions.includes(permission));
    if (!hasPartnerScope(effectivePermissions, args.resource, args.action)) {
      return { ok: false, reason: "permission_denied" };
    }
    if (!hasPartnerScope(connection.scopes, args.resource, args.action)) {
      return { ok: false, reason: "connection_scope_denied" };
    }

    const now = Date.now();
    await ctx.db.patch(key._id, { lastUsedAt: now, updatedAt: now });

    return {
      ok: true,
      organizationId: key.organizationId,
      partnerId: key.partnerId,
      partnerClientId: key.partnerClientId,
      partnersAppId: key.partnersAppId,
      partnersClientId: key.partnersClientId,
      connectionId: key.connectionId,
      apiKeyId: key._id,
      permissions: effectivePermissions,
      name: key.name,
    };
  },
});
