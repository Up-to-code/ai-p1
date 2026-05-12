import { NextRequest, NextResponse } from "next/server";

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
  const response = await fetch(new URL("/api/auth/oauth2/token", request.nextUrl.origin), {
    method: "POST",
    headers: forwardedHeaders(request),
    body: await request.text(),
    redirect: "manual",
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
