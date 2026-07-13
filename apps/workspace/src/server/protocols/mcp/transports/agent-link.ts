import type { Context, Hono } from "hono";
import { resolveAuthTopology } from "@qentrah/auth/config";

const OAUTH_MCP_URL = resolveAuthTopology().mcpResourceUrl;

/** Temporary migration tombstone. It never reads or validates the legacy URL secret. */
export function handleRetiredMcpAgentLink(c: Context) {
  return c.json(
    {
      error: "legacy_mcp_link_retired",
      message: "Secret-based MCP links are no longer supported. Reconnect with OAuth.",
      mcpUrl: OAUTH_MCP_URL,
    },
    410,
    { "cache-control": "no-store" },
  );
}

export function registerMcpAgentTransport(app: Hono) {
  app.all("/mcp/agent/:publicId/:secret", handleRetiredMcpAgentLink);
}
