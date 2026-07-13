import type { McpGrantAuthorization } from "@qentrah/mcp-contracts";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const authorizeGrant = makeFunctionReference<"action">("mcp/toolsOAuth:authorizeOAuthGrant");
const callTool = makeFunctionReference<"action">("mcp/toolsOAuth:callToolOAuth");

export type McpToolInput = Record<string, unknown>;

export type McpExecutor = {
  authorizeGrant: () => Promise<McpGrantAuthorization>;
  executeTool: (tool: string, input: McpToolInput) => Promise<unknown>;
};

/**
 * Creates one request-scoped Convex executor. The access token is attached to
 * a private client so concurrent MCP requests cannot overwrite each other's
 * authentication state.
 */
export function createMcpConvexExecutor(input: {
  convexUrl: string;
  token: string;
}): McpExecutor {
  const convexUrl = input.convexUrl.trim();
  const token = input.token.trim();
  if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is required for MCP execution.");
  if (!token) throw new Error("An MCP bearer token is required for Convex execution.");

  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(token);

  return {
    authorizeGrant: () =>
      client.action(authorizeGrant, {}) as Promise<McpGrantAuthorization>,
    executeTool: (tool, toolInput) =>
      client.action(callTool, { tool, input: toolInput }),
  };
}
