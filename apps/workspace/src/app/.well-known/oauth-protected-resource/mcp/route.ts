import { NextResponse } from "next/server";

/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728).
 * Advertises that this MCP endpoint requires a Bearer token
 * obtained from the application's own auth server.
 */
export function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return NextResponse.json(
    {
      resource: `${appUrl}/mcp`,
      authorization_servers: [`${appUrl}/api/auth`],
      bearer_methods_supported: ["header"],
      scopes_supported: ["mcp:read", "mcp:write"],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
