import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "../_generated/server";
import { mcpActor } from "../workspace/businessData";
import { executeMcpToolCall } from "./toolCall";
import { readHandlers, writeHandlers } from "./handlers/registry";
import { registerAllHandlers } from "./handlers";
import { inputObject } from "./toolInputs";
import {
  mcpReadToolNames as readTools,
  mcpToolPermissionMap as toolPermissions,
} from "./toolRegistry";

registerAllHandlers();

export const mcpToolPermissionMap = toolPermissions;
export const mcpReadToolNames = readTools;

export const callTool = action({
  args: {
    publicId: v.string(),
    secret: v.string(),
    tool: v.string(),
    input: v.optional(v.any()),
    appBaseUrl: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<unknown> => {
    return executeMcpToolCall(ctx, args);
  },
});

export const readTool = internalQuery({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationMcpConnections"),
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
      connectionId: args.connectionId,
      input: inputObject(args.input),
      appBaseUrl: args.appBaseUrl,
      permissions: args.permissions ?? [],
      instructions: args.instructions,
      connectionName: args.connectionName,
    });
  },
});

export const writeTool = internalMutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationMcpConnections"),
    tool: v.string(),
    input: v.any(),
    appBaseUrl: v.optional(v.string()),
    permissions: v.array(v.any()),
    instructions: v.optional(v.string()),
    connectionName: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const handler = writeHandlers.get(args.tool);
    if (!handler) throw new Error("Unsupported write tool.");
    return handler(ctx, {
      organizationId: args.organizationId,
      connectionId: args.connectionId,
      input: inputObject(args.input),
      appBaseUrl: args.appBaseUrl,
      permissions: args.permissions ?? [],
      instructions: args.instructions,
      connectionName: args.connectionName,
      now: Date.now(),
      actorId: mcpActor(args.connectionId),
    });
  },
});
