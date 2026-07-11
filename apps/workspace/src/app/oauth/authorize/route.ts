import { NextRequest, NextResponse } from "next/server";
import { oauthDebug } from "@/server/domains/partnerApps/services/oauth-debug";

export const dynamic = "force-dynamic";

type RedirectEnvelope = {
  redirect?: boolean;
  url?: string;
};

function forwardedHeaders(request: NextRequest) {
  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  headers.set("accept", "application/json");
  return headers;
}

function absoluteRedirectUrl(value: string, request: NextRequest) {
  return new URL(value, request.nextUrl.origin);
}

function redirectDebugTarget(url: URL) {
  return {
    origin: url.origin,
    pathname: url.pathname,
    searchParamCount: url.searchParams.size,
  };
}

export async function GET(request: NextRequest) {
  const target = new URL("/api/auth/oauth2/authorize", request.nextUrl.origin);
  target.search = request.nextUrl.search;
  const prompts = new Set(
    (target.searchParams.get("prompt") ?? "")
      .split(/\s+/u)
      .filter(Boolean),
  );
  prompts.delete("none");
  prompts.add("select_account");
  prompts.add("consent");
  target.searchParams.set("prompt", [...prompts].join(" "));
  oauthDebug("workspace.oauth.authorize.start", {
    clientId: request.nextUrl.searchParams.get("client_id"),
    redirectUri: request.nextUrl.searchParams.get("redirect_uri"),
    responseType: request.nextUrl.searchParams.get("response_type"),
    scopeCount: (request.nextUrl.searchParams.get("scope") ?? "").split(/\s+/u).filter(Boolean).length,
    resource: request.nextUrl.searchParams.get("resource"),
    state: request.nextUrl.searchParams.get("state"),
    codeChallenge: request.nextUrl.searchParams.get("code_challenge"),
  });

  const response = await fetch(target, {
    method: "GET",
    headers: forwardedHeaders(request),
    redirect: "manual",
  });

  const location = response.headers.get("location");
  if (location) {
    const redirectTarget = absoluteRedirectUrl(location, request);
    oauthDebug("workspace.oauth.authorize.redirect", {
      clientId: request.nextUrl.searchParams.get("client_id"),
      status: response.status,
      ...redirectDebugTarget(redirectTarget),
    });
    return NextResponse.redirect(redirectTarget, response.status);
  }

  const payload = await response.clone().json().catch(() => null) as RedirectEnvelope | null;
  if (payload?.redirect && payload.url) {
    const redirectTarget = absoluteRedirectUrl(payload.url, request);
    oauthDebug("workspace.oauth.authorize.payload_redirect", {
      clientId: request.nextUrl.searchParams.get("client_id"),
      ...redirectDebugTarget(redirectTarget),
    });
    return NextResponse.redirect(redirectTarget);
  }

  oauthDebug("workspace.oauth.authorize.response", {
    clientId: request.nextUrl.searchParams.get("client_id"),
    status: response.status,
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
