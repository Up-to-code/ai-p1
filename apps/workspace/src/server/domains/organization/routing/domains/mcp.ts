import { Hono, type Context } from "hono";
export const mcpSubRouter = new Hono();

const retiredMcpConnections = (c: Context) => c.json({
  error: "legacy_mcp_connections_retired",
  message: "Manage OAuth MCP grants from the MCP settings screen.",
  mcpUrl: process.env.MCP_RESOURCE_URL ?? "https://mcp.qentrah.com/mcp",
}, 410);

mcpSubRouter.all("/:organizationId/mcp-connections", retiredMcpConnections);
mcpSubRouter.all("/:organizationId/mcp-connections/*", retiredMcpConnections);
