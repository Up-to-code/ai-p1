import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { authUser } from "../auth";
import {
  mcpPermissionValidator,
  mcpScopeValidator,
  type McpAction,
  type McpPermission,
} from "./validators";
import { canActorUseMcpPermission, resolveScopePolicy } from "./scopePolicy";
import { mcpToolPermissionMap, toolsForMcpAdapter } from "./toolRegistry";

const grantLifetimeDaysValidator = v.union(v.literal(7), v.literal(30), v.literal(90));
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_GRANTS_PER_USER = 100;

function presentGrant(grant: Doc<"mcpOAuthGrants">) {
  return {
    id: grant._id,
    organizationId: grant.organizationId,
    userId: grant.userId,
    oauthClientId: grant.oauthClientId,
    clientName: grant.clientName,
    permissions: grant.permissions,
    scope: grant.scope,
    status: grant.status,
    createdAt: grant.createdAt,
    updatedAt: grant.updatedAt,
    expiresAt: grant.expiresAt,
    lastUsedAt: grant.lastUsedAt,
    usageCount: grant.usageCount,
    revokedAt: grant.revokedAt,
  };
}

async function livePermissions(
  ctx: Parameters<typeof resolveScopePolicy>[0],
  organizationId: string,
  userId: string,
  scope: Doc<"mcpOAuthGrants">["scope"],
  requested: McpPermission[],
) {
  const policy = await resolveScopePolicy(ctx, { organizationId, actorUserId: userId, scope });
  const permissions: McpPermission[] = [];
  for (const permission of requested) {
    const actions: McpAction[] = [];
    for (const action of permission.actions) {
      if (await canActorUseMcpPermission(ctx, policy, permission.resource, action)) actions.push(action);
    }
    if (actions.length > 0) permissions.push({ resource: permission.resource, actions });
  }
  return { policy, permissions };
}

export const upsert = mutation({
  args: {
    organizationId: v.string(),
    oauthClientId: v.string(),
    clientName: v.string(),
    permissions: v.array(mcpPermissionValidator),
    scope: mcpScopeValidator,
    lifetimeDays: grantLifetimeDaysValidator,
  },
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const clientName = args.clientName.trim().slice(0, 120);
    if (!clientName || !args.oauthClientId.trim()) throw new Error("OAuth client is required.");
    const { permissions } = await livePermissions(ctx, args.organizationId, user._id, args.scope, args.permissions);
    if (permissions.length === 0) throw new Error("At least one permitted action is required.");

    const existing = await ctx.db
      .query("mcpOAuthGrants")
      .withIndex("by_user_organization_client", (q) =>
        q.eq("userId", user._id).eq("organizationId", args.organizationId).eq("oauthClientId", args.oauthClientId),
      )
      .first();
    const now = Date.now();
    const patch = {
      clientName,
      permissions,
      scope: args.scope,
      status: "active" as const,
      updatedAt: now,
      expiresAt: now + args.lifetimeDays * DAY_MS,
      revokedAt: undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { grantId: existing._id, permissions, expiresAt: patch.expiresAt };
    }

    const current = await ctx.db
      .query("mcpOAuthGrants")
      .withIndex("by_user_organization", (q) => q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .take(MAX_GRANTS_PER_USER + 1);
    if (current.length >= MAX_GRANTS_PER_USER) throw new Error("Too many OAuth MCP grants.");
    const grantId = await ctx.db.insert("mcpOAuthGrants", {
      organizationId: args.organizationId,
      userId: user._id,
      oauthClientId: args.oauthClientId,
      clientName,
      permissions,
      scope: args.scope,
      status: "active",
      createdAt: now,
      updatedAt: now,
      expiresAt: patch.expiresAt,
      usageCount: 0,
    });
    return { grantId, permissions, expiresAt: patch.expiresAt };
  },
});

export const listMine = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const grants = await ctx.db
      .query("mcpOAuthGrants")
      .withIndex("by_user_organization", (q) => q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .take(MAX_GRANTS_PER_USER);
    return grants.map(presentGrant);
  },
});

export const revoke = mutation({
  args: { grantId: v.id("mcpOAuthGrants") },
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const grant = await ctx.db.get(args.grantId);
    if (!grant || grant.userId !== user._id) throw new Error("OAuth MCP grant was not found.");
    const now = Date.now();
    await ctx.db.patch(args.grantId, { status: "revoked", revokedAt: now, updatedAt: now });
    return { ok: true };
  },
});

export const resolveInternal = internalQuery({
  args: { userId: v.string(), organizationId: v.string(), oauthClientId: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const grant = await ctx.db
      .query("mcpOAuthGrants")
      .withIndex("by_user_organization_client", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId).eq("oauthClientId", args.oauthClientId),
      )
      .first();
    if (!grant || grant.status !== "active" || grant.expiresAt <= args.now) {
      throw new Error("OAuth MCP approval is required.");
    }
    const { policy, permissions } = await livePermissions(ctx, grant.organizationId, grant.userId, grant.scope, grant.permissions);
    if (permissions.length === 0) throw new Error("OAuth MCP access is no longer available.");
    return { grant, permissions, policy };
  },
});

export const recordUseInternal = internalMutation({
  args: { grantId: v.id("mcpOAuthGrants"), now: v.number() },
  handler: async (ctx, args) => {
    const grant = await ctx.db.get(args.grantId);
    if (!grant || grant.status !== "active") return;
    await ctx.db.patch(args.grantId, {
      lastUsedAt: args.now,
      usageCount: grant.usageCount + 1,
      updatedAt: args.now,
    });
  },
});

export function authorizedTools(permissions: McpPermission[]) {
  return toolsForMcpAdapter()
    .filter((tool) => permissions.some((permission) =>
      permission.resource === tool.resource && permission.actions.includes(tool.action),
    ))
    .map(({ name, title, description, resource, action, destructive }) => ({
      name, title, description, resource, action, ...(destructive ? { destructive: true } : {}),
    }));
}

export function assertOAuthToolPermission(permissions: McpPermission[], tool: string) {
  const required = mcpToolPermissionMap[tool];
  if (!required) throw new Error("Unknown MCP tool.");
  const allowed = permissions.some((permission) =>
    permission.resource === required.resource && permission.actions.includes(required.action),
  );
  if (!allowed) throw new Error("OAuth MCP grant does not allow this tool.");
  return required;
}
