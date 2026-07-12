import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { mcpActor } from "../workspace/businessData";
import { readHandlers, writeHandlers } from "./handlers/registry";
import { registerAllHandlers } from "./handlers";
import { inputObject } from "./toolInputs";
import { mcpReadToolNames as readTools } from "./toolRegistry";
import { attachScopePolicyInput } from "./scopePolicy";
import { assertOAuthToolPermission, authorizedTools } from "./oauthGrants";

registerAllHandlers();

function identityContext(identity: Record<string, unknown> | null) {
  if (!identity) throw new Error("Authentication required.");
  const scopes = String(identity.scope ?? "").split(/\s+/u).filter(Boolean);
  if (!scopes.includes("mcp:read")) throw new Error("MCP read permission is required.");
  const userId = String(identity.subject ?? identity.sub ?? "");
  const organizationId = String(identity.org_id ?? identity.orgId ?? "");
  const oauthClientId = String(identity.azp ?? identity.client_id ?? "");
  if (!userId || !organizationId || !oauthClientId) {
    throw new Error("OAuth MCP identity is incomplete.");
  }
  return { userId, organizationId, oauthClientId, scopes };
}

async function resolveGrant(ctx: ActionCtx): Promise<any> {
  const identity = await ctx.auth.getUserIdentity();
  const auth = identityContext(identity as unknown as Record<string, unknown> | null);
  const resolved = await ctx.runQuery(internal.mcp.oauthGrants.resolveInternal, {
    userId: auth.userId,
    organizationId: auth.organizationId,
    oauthClientId: auth.oauthClientId,
    now: Date.now(),
  });
  const rate = await ctx.runMutation(internal.mcp.rateLimits.reserve, {
    key: `grant:${resolved.grant._id}:authorize`, max: 120, windowMs: 60_000, now: Date.now(),
  });
  if (!rate.allowed) throw new Error("MCP_RATE_LIMITED");
  return { auth, resolved };
}

export const authorizeOAuthGrant = action({
  args: {},
  returns: v.any(),
  handler: async (ctx): Promise<any> => {
    const { auth, resolved } = await resolveGrant(ctx);
    return {
      grantId: resolved.grant._id,
      organizationId: auth.organizationId,
      clientId: auth.oauthClientId,
      userId: auth.userId,
      expiresAt: resolved.grant.expiresAt,
      tools: authorizedTools(resolved.permissions),
    };
  },
});

export const callToolOAuth = action({
  args: { tool: v.string(), input: v.optional(v.any()) },
  returns: v.any(),
  handler: async (ctx, args): Promise<unknown> => {
    const { auth, resolved } = await resolveGrant(ctx);
    assertOAuthToolPermission(resolved.permissions, args.tool);
    if (!readTools.has(args.tool) && !auth.scopes.includes("mcp:write")) {
      throw new Error("MCP write permission is required.");
    }

    const now = Date.now();
    const destructive = args.tool.endsWith("_delete") || args.tool.includes("_cancel");
    const write = !readTools.has(args.tool);
    const rate = await ctx.runMutation(internal.mcp.rateLimits.reserve, {
      key: `grant:${resolved.grant._id}:${destructive ? "destructive" : write ? "write" : "read"}`,
      max: destructive ? 10 : write ? 30 : 120,
      windowMs: 60_000,
      now,
    });
    if (!rate.allowed) throw new Error("MCP_RATE_LIMITED");
    const common = {
      organizationId: auth.organizationId,
      connectionId: resolved.grant._id,
      tool: args.tool,
      input: attachScopePolicyInput(inputObject(args.input), resolved.policy),
      appBaseUrl: undefined as string | undefined,
      permissions: resolved.permissions,
      instructions: undefined as string | undefined,
      connectionName: resolved.grant.clientName,
    };

    const result = readTools.has(args.tool)
      ? await ctx.runQuery(internal.mcp.toolsOAuth.readToolOAuth, common)
      : await ctx.runMutation(internal.mcp.toolsOAuth.writeToolOAuth, {
          ...common,
          now,
          actorId: mcpActor(resolved.grant._id),
        });
    await ctx.runMutation(internal.mcp.oauthGrants.recordUseInternal, {
      grantId: resolved.grant._id,
      now,
    });
    return result;
  },
});

export const readToolOAuth = internalQuery({
  args: {
    organizationId: v.string(), connectionId: v.string(), tool: v.string(), input: v.any(),
    appBaseUrl: v.optional(v.string()), permissions: v.array(v.any()),
    instructions: v.optional(v.string()), connectionName: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const handler = readHandlers.get(args.tool);
    if (!handler) throw new Error("Unsupported read tool.");
    return handler(ctx, { ...args, input: inputObject(args.input), permissions: args.permissions ?? [] });
  },
});

export const writeToolOAuth = internalMutation({
  args: {
    organizationId: v.string(), connectionId: v.string(), tool: v.string(), input: v.any(),
    appBaseUrl: v.optional(v.string()), permissions: v.array(v.any()),
    instructions: v.optional(v.string()), connectionName: v.optional(v.string()),
    now: v.number(), actorId: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const handler = writeHandlers.get(args.tool);
    if (!handler) throw new Error("Unsupported write tool.");
    return handler(ctx, { ...args, input: inputObject(args.input), permissions: args.permissions ?? [] });
  },
});
