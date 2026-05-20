import { NextRequest, NextResponse } from "next/server";
import { oauthDebug } from "@/server/domains/partnerApps/services/oauth-debug";

export const dynamic = "force-dynamic";

function forwardedHeaders(request: NextRequest) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);
  if (cookie) headers.set("cookie", cookie);
  headers.set("accept", "application/json");
  return headers;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const form = new URLSearchParams(body);
  oauthDebug("workspace.oauth.token.start", {
    clientId: form.get("client_id"),
    grantType: form.get("grant_type"),
    redirectUri: form.get("redirect_uri"),
    resource: form.get("resource"),
    code: form.get("code"),
    codeVerifier: form.get("code_verifier"),
    hasClientSecret: Boolean(form.get("client_secret")),
  });

  const response = await fetch(new URL("/api/auth/oauth2/token", request.nextUrl.origin), {
    method: "POST",
    headers: forwardedHeaders(request),
    body,
    redirect: "manual",
  });

  oauthDebug("workspace.oauth.token.response", {
    clientId: form.get("client_id"),
    status: response.status,
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
