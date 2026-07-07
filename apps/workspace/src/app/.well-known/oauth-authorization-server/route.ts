import { NextResponse } from "next/server";

function metadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return {
    issuer: `${appUrl}/api/auth`,
    authorization_endpoint: `${appUrl}/api/auth/sign-in`,
    token_endpoint: `${appUrl}/api/auth/token`,
    registration_endpoint: `${appUrl}/api/auth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["profile", "email"],
    code_challenge_methods_supported: ["S256"],
  };
}

export function GET() {
  return NextResponse.json(metadata(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
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
