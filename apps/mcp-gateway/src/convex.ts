import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import type { McpGrantAuthorization } from "@qentrah/mcp-contracts";
import type { GatewayConfig } from "./config.js";
import type { GatewayIdentity } from "./auth.js";

const authorizeGrant = makeFunctionReference<"action">("mcp/toolsOAuth:authorizeOAuthGrant");
const callTool = makeFunctionReference<"action">("mcp/toolsOAuth:callToolOAuth");

function clientFor(identity: GatewayIdentity, config: GatewayConfig) {
  const client = new ConvexHttpClient(config.convexUrl);
  client.setAuth(identity.token);
  return client;
}

export function resolveGrant(identity: GatewayIdentity, config: GatewayConfig) {
  return clientFor(identity, config).action(authorizeGrant, {}) as Promise<McpGrantAuthorization>;
}

export function executeTool(
  identity: GatewayIdentity,
  config: GatewayConfig,
  tool: string,
  input: Record<string, unknown>,
) {
  return clientFor(identity, config).action(callTool, { tool, input });
}
