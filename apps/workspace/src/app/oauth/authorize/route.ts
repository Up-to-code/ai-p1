import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const target = new URL("/api/auth/oauth2/authorize", request.nextUrl.origin);
  target.search = request.nextUrl.search;

  const response = await fetch(target, {
    method: "GET",
    headers: forwardedHeaders(request),
    redirect: "manual",
  });

  const location = response.headers.get("location");
  if (location) {
    return NextResponse.redirect(absoluteRedirectUrl(location, request), response.status);
  }

  const payload = await response.clone().json().catch(() => null) as RedirectEnvelope | null;
  if (payload?.redirect && payload.url) {
    return NextResponse.redirect(absoluteRedirectUrl(payload.url, request));
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
