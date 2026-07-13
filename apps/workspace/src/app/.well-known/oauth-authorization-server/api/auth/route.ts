import { NextResponse } from "next/server";
import { resolveAuthTopology } from "@qentrah/auth/config";

function authServerMetadata() {
  const topology = resolveAuthTopology();

  return {
    issuer: topology.authIssuer,
    authorization_endpoint: `${topology.workspaceOrigin}/oauth/authorize`,
    token_endpoint: `${topology.authIssuer}/oauth2/token`,
    registration_endpoint: `${topology.authIssuer}/oauth2/register`,
    jwks_uri: topology.jwksUrl,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["openid", "profile", "email", "offline_access", "mcp:read", "mcp:write"],
  };
}

export function GET() {
  return NextResponse.json(authServerMetadata(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
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
