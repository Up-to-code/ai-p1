import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { mcpActor } from "../workspace/businessData";
import { readHandlers, writeHandlers } from "./handlers/registry";
import { registerAllHandlers } from "./handlers";
import { inputObject } from "./toolInputs";
import {
  mcpReadToolNames as readTools,
  mcpToolPermissionMap as toolPermissions,
} from "./toolRegistry";

registerAllHandlers();

export const callToolOAuth = action({
  args: {
    tool: v.string(),
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<unknown> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required.");

    const scopes = String((identity as Record<string, unknown>).scope ?? "")
      .split(/\s+/u)
      .filter(Boolean);
    if (!scopes.includes("mcp:read")) {
      throw new Error("MCP read permission is required.");
    }

    const userId = identity.subject;
    const orgId = (identity as Record<string, unknown>)["org_id"] as string | undefined
      ?? (identity as Record<string, unknown>)["orgId"] as string | undefined;
    if (!orgId) throw new Error("Organization context required.");

    const permission = toolPermissions[args.tool];
    if (!permission) throw new Error("Unknown tool.");
    if (!readTools.has(args.tool) && !scopes.includes("mcp:write")) {
      throw new Error("MCP write permission is required.");
    }

    const common = {
      organizationId: orgId,
      connectionId: userId,
      tool: args.tool,
      input: inputObject(args.input),
      appBaseUrl: undefined as string | undefined,
      permissions: [] as unknown[],
      instructions: undefined as string | undefined,
      connectionName: undefined as string | undefined,
    };

    return readTools.has(args.tool)
      ? await ctx.runQuery(internal.mcp.toolsOAuth.readToolOAuth, common)
      : await ctx.runMutation(internal.mcp.toolsOAuth.writeToolOAuth, { ...common, now: Date.now(), actorId: mcpActor(userId) });
  },
});

export const readToolOAuth = internalQuery({
  args: {
    organizationId: v.string(),
    connectionId: v.string(),
    tool: v.string(),
    input: v.any(),
    appBaseUrl: v.optional(v.string()),
    permissions: v.array(v.any()),
    instructions: v.optional(v.string()),
    connectionName: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const handler = readHandlers.get(args.tool);
    if (!handler) throw new Error("Unsupported read tool.");
    return handler(ctx, {
      organizationId: args.organizationId,
      connectionId: args.connectionId as unknown as Id<"organizationMcpConnections">,
      input: inputObject(args.input),
      appBaseUrl: args.appBaseUrl,
      permissions: args.permissions ?? [],
      instructions: args.instructions,
      connectionName: args.connectionName,
    });
  },
});

export const writeToolOAuth = internalMutation({
  args: {
    organizationId: v.string(),
    connectionId: v.string(),
    tool: v.string(),
    input: v.any(),
    appBaseUrl: v.optional(v.string()),
    permissions: v.array(v.any()),
    instructions: v.optional(v.string()),
    connectionName: v.optional(v.string()),
    now: v.number(),
    actorId: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const handler = writeHandlers.get(args.tool);
    if (!handler) throw new Error("Unsupported write tool.");
    return handler(ctx, {
      organizationId: args.organizationId,
      connectionId: args.connectionId as unknown as Id<"organizationMcpConnections">,
      input: inputObject(args.input),
      appBaseUrl: args.appBaseUrl,
      permissions: args.permissions ?? [],
      instructions: args.instructions,
      connectionName: args.connectionName,
      now: args.now,
      actorId: args.actorId,
    });
  },
});
