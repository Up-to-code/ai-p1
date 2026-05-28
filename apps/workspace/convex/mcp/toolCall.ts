import type { ActionCtx } from "../_generated/server";
import { api, internal } from "../_generated/api";
import {
  mcpReadToolNames as readTools,
  mcpToolPermissionMap as toolPermissions,
} from "./toolRegistry";

type Input = Record<string, unknown>;

function inputObject(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Input)
    : {};
}

export async function executeMcpToolCall(
  ctx: ActionCtx,
  args: {
    publicId: string;
    secret: string;
    tool: string;
    input?: unknown;
    appBaseUrl?: string;
  },
) {
  const permission = toolPermissions[args.tool];
  if (!permission) throw new Error("Unknown tool.");

  const validation = await ctx.runQuery(api.mcp.connections.validateConnection, {
    publicId: args.publicId,
    secret: args.secret,
    resource: permission.resource,
    action: permission.action,
  });
  if (!validation.ok || !validation.organizationId || !validation.connectionId || !validation.keyId) {
    throw new Error(validation.reason ?? "Agent link is not allowed.");
  }

  const reserved = await ctx.runMutation(internal.mcp.connections.reserveUsage, {
    organizationId: validation.organizationId,
    connectionId: validation.connectionId,
    keyId: validation.keyId,
    tool: args.tool,
  });
  if (!reserved.ok) throw new Error(reserved.reason ?? "Agent link is not available.");

  const common = {
    organizationId: validation.organizationId,
    connectionId: validation.connectionId,
    tool: args.tool,
    input: inputObject(args.input),
    appBaseUrl: args.appBaseUrl,
    permissions: validation.permissions ?? [],
    instructions: validation.instructions,
    connectionName: validation.name,
  };

  return readTools.has(args.tool)
    ? await ctx.runQuery(internal.mcp.tools.readTool, common)
    : await ctx.runMutation(internal.mcp.tools.writeTool, common);
}
