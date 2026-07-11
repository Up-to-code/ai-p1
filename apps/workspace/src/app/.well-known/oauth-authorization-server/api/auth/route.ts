import { NextResponse } from "next/server";

function authServerMetadata() {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/u, "");
  const issuer = `${appUrl}/api/auth`;

  return {
    issuer,
    authorization_endpoint: `${appUrl}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth2/token`,
    registration_endpoint: `${issuer}/oauth2/register`,
    jwks_uri: `${issuer}/jwks`,
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
