const resourceUrl = process.env.MCP_RESOURCE_URL ?? "https://mcp.qentrah.com/mcp";

export function POST() {
  return Response.json({
    error: "mcp_resource_moved",
    message: "Use the dedicated OAuth-protected Qentrah MCP resource.",
    mcpUrl: resourceUrl,
  }, { status: 410, headers: { "cache-control": "no-store" } });
}
