import { ConvexError, v } from "convex/values";
import { mutationGeneric, queryGeneric } from "convex/server";
import { sandboxActionValidator, sandboxResourceTypeValidator } from "../schema";
import { randomToken, requirePartnerIdentity } from "../partnerRuntime";
import { ensureSandboxOrganization, findOwnedAppByClientId } from "./db";
import { normalizeRequestedScopes } from "./validation";
import { ACCESS_TOKEN_TTL_MS, AUTH_CODE_TTL_MS, REFRESH_TOKEN_TTL_MS, scopeFor } from "./types";

export const createAuthorizationCode = mutationGeneric({
  args: {
    clientId: v.string(),
    redirectUri: v.string(),
    scopes: v.array(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: v.literal("S256"),
  },
  handler: async (ctx, args) => {
    const identity = await requirePartnerIdentity(ctx);
    const app = await findOwnedAppByClientId(ctx, args.clientId, identity.subject);
    if (!app.redirectUris.includes(args.redirectUri)) {
      throw new ConvexError({ code: "INVALID_REDIRECT_URI", message: "Redirect URI is not registered for this app." });
    }
    if (!args.codeChallenge.trim()) {
      throw new ConvexError({ code: "INVALID_PKCE", message: "PKCE code challenge is required." });
    }

    const organization = await ensureSandboxOrganization(ctx, app);
    const now = Date.now();
    const code = randomToken("sandbox_code", 24);
    await ctx.db.insert("sandboxOAuthCodes", {
      partnerAuthSubject: identity.subject,
      partnerAppId: app._id,
      organizationId: organization.organizationId,
      code,
      clientId: app.clientId,
      redirectUri: args.redirectUri,
      scopes: normalizeRequestedScopes(args.scopes),
      codeChallenge: args.codeChallenge,
      codeChallengeMethod: "S256",
      expiresAt: now + AUTH_CODE_TTL_MS,
      createdAt: now,
    });
    return { code, redirectUri: args.redirectUri, organizationId: organization.organizationId };
  },
});

export const exchangeAuthorizationCode = mutationGeneric({
  args: {
    code: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    accessTokenHash: v.string(),
    refreshTokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    const code = await ctx.db
      .query("sandboxOAuthCodes")
      .withIndex("by_code", (q: any) => q.eq("code", args.code))
      .first();
    const now = Date.now();
    if (!code || code.clientId !== args.clientId || code.redirectUri !== args.redirectUri) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Sandbox authorization code is invalid." });
    }
    if (code.consumedAt || code.expiresAt <= now) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Sandbox authorization code is expired or already used." });
    }
    if (code.codeChallenge !== args.codeChallenge) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "PKCE verification failed." });
    }
    const app = await ctx.db.get(code.partnerAppId);
    if (!app) throw new ConvexError({ code: "INVALID_GRANT", message: "Sandbox app was not found." });

    await ctx.db.patch(code._id, { consumedAt: now });
    await ctx.db.insert("sandboxOAuthTokens", {
      partnerAuthSubject: code.partnerAuthSubject,
      partnerAppId: code.partnerAppId,
      organizationId: code.organizationId,
      accessTokenHash: args.accessTokenHash,
      refreshTokenHash: args.refreshTokenHash,
      clientId: args.clientId,
      scopes: code.scopes,
      status: "active",
      accessExpiresAt: now + ACCESS_TOKEN_TTL_MS,
      refreshExpiresAt: now + REFRESH_TOKEN_TTL_MS,
      createdAt: now,
      updatedAt: now,
    });

    return {
      organizationId: code.organizationId,
      scopes: code.scopes,
      expiresIn: ACCESS_TOKEN_TTL_MS / 1000,
    };
  },
});

export const rotateRefreshToken = mutationGeneric({
  args: {
    refreshTokenHash: v.string(),
    accessTokenHash: v.string(),
    nextRefreshTokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sandboxOAuthTokens")
      .withIndex("by_refreshTokenHash", (q: any) => q.eq("refreshTokenHash", args.refreshTokenHash))
      .first();
    const now = Date.now();
    if (!existing || existing.status !== "active" || !existing.refreshExpiresAt || existing.refreshExpiresAt <= now) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Sandbox refresh token is invalid or expired." });
    }
    await ctx.db.patch(existing._id, { status: "rotated", updatedAt: now });
    await ctx.db.insert("sandboxOAuthTokens", {
      partnerAuthSubject: existing.partnerAuthSubject,
      partnerAppId: existing.partnerAppId,
      organizationId: existing.organizationId,
      accessTokenHash: args.accessTokenHash,
      refreshTokenHash: args.nextRefreshTokenHash,
      clientId: existing.clientId,
      scopes: existing.scopes,
      status: "active",
      accessExpiresAt: now + ACCESS_TOKEN_TTL_MS,
      refreshExpiresAt: now + REFRESH_TOKEN_TTL_MS,
      createdAt: now,
      updatedAt: now,
    });
    return {
      organizationId: existing.organizationId,
      scopes: existing.scopes,
      expiresIn: ACCESS_TOKEN_TTL_MS / 1000,
    };
  },
});

export const validateAccess = queryGeneric({
  args: {
    accessTokenHash: v.string(),
    organizationId: v.string(),
    resource: sandboxResourceTypeValidator,
    action: sandboxActionValidator,
  },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query("sandboxOAuthTokens")
      .withIndex("by_accessTokenHash", (q: any) => q.eq("accessTokenHash", args.accessTokenHash))
      .first();
    if (!token || token.status !== "active") return { ok: false, reason: "invalid_token" };
    if (token.organizationId !== args.organizationId) return { ok: false, reason: "wrong_organization" };
    if (token.accessExpiresAt <= Date.now()) return { ok: false, reason: "token_expired" };
    if (!token.scopes.includes(scopeFor(args.resource, args.action))) return { ok: false, reason: "scope_denied" };

    const app = await ctx.db.get(token.partnerAppId);
    return {
      ok: true,
      partnerAuthSubject: token.partnerAuthSubject,
      partnerAppId: token.partnerAppId,
      organizationId: token.organizationId,
      clientId: token.clientId,
      scopes: token.scopes,
      appName: app?.name,
    };
  },
});
