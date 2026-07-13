import { resolveAuthTopology } from "@qentrah/auth/config";

const discoveryHeaders = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=300",
} as const;

/** OAuth 2.0 Protected Resource Metadata for the workspace-owned MCP route. */
export function GET() {
  const topology = resolveAuthTopology();
  return Response.json(
    {
      resource: topology.mcpResourceUrl,
      authorization_servers: [topology.authIssuer],
      bearer_methods_supported: ["header"],
      scopes_supported: ["mcp:read", "mcp:write"],
    },
    { headers: discoveryHeaders },
  );
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...discoveryHeaders,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    },
  });
}
