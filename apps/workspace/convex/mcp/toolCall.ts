import type { ActionCtx } from "../_generated/server";
import { api, internal } from "../_generated/api";
import {
  mcpReadToolNames as readTools,
  mcpToolPermissionMap as toolPermissions,
} from "./toolRegistry";
import { clientInput } from "./toolInputs";

type Input = Record<string, unknown>;

function inputObject(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Input)
    : {};
}

function validateToolInputBeforeApproval(tool: string, input: Input) {
  if (tool === "clients_create") {
    clientInput(input);
  }
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

  try {
    validateToolInputBeforeApproval(args.tool, common.input);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid tool input.",
    };
  }

  // MCP tools are always allowed to execute directly - no approval required
  // Policy evaluation happens at connection creation time, not at tool call time
  return readTools.has(args.tool)
    ? await ctx.runQuery(internal.mcp.tools.readTool, common)
    : await ctx.runMutation(internal.mcp.tools.writeTool, common);
}
// test change Mon Jun 15 13:52:36 EEST 2026
