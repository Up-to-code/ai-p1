import type { ActionCtx } from "../_generated/server";
import { api, internal } from "../_generated/api";
import {
  mcpReadToolNames as readTools,
  mcpToolPermissionMap as toolPermissions,
} from "./toolRegistry";
import { getRegistryTool } from "../../src/server/protocols/mcp/tools/registry-core";
import { evaluateAgentToolPolicy } from "../../src/server/domains/agents/policies/tool-policy";

type Input = Record<string, unknown>;

function inputObject(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Input)
    : {};
}

function compactPreview(value: unknown, maxLength = 900) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? {});
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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

  const tool = getRegistryTool(args.tool);
  const decision = evaluateAgentToolPolicy({
    adapter: "mcp",
    actorType: "mcpConnection",
    organizationId: validation.organizationId,
    tool: tool as never,
    permissions: validation.permissions ?? [],
    inputPreview: compactPreview(common.input),
  });

  if (decision.state === "blocked") {
    throw new Error(decision.reason);
  }

  if (decision.state === "requires_user_approval" || decision.state === "requires_admin_approval") {
    const confirmation = await ctx.runMutation(internal.agents.confirmations.createFromMcpLink, {
      organizationId: validation.organizationId,
      connectionId: validation.connectionId,
      createdByUserId: validation.createdByUserId ?? "unknown",
      tool: args.tool,
      resource: permission.resource,
      action: permission.action,
      riskLevel: decision.riskLevel ?? "admin",
      approvalRequirement: decision.state === "requires_admin_approval" ? "admin" : "user",
      summary: `${tool?.title ?? args.tool}: ${compactPreview(common.input, 220)}`,
      inputPreview: compactPreview(common.input, 500),
      input: common.input,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return {
      ok: false,
      confirmationRequired: true,
      approvalType: decision.state === "requires_admin_approval" ? "admin" : "user",
      confirmation: {
        confirmationId: confirmation.id,
        summary: confirmation.summary,
        resource: confirmation.resource,
        action: confirmation.action,
        inputPreview: confirmation.inputPreview,
        expiresAt: confirmation.expiresAt,
      },
      message: decision.reason,
    };
  }

  return readTools.has(args.tool)
    ? await ctx.runQuery(internal.mcp.tools.readTool, common)
    : await ctx.runMutation(internal.mcp.tools.writeTool, common);
}
