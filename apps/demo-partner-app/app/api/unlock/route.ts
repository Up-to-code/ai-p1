import { NextRequest, NextResponse } from "next/server";
import { gateCookieName, secureCookieOptions } from "@/lib/cookies";
import { demoConfig } from "@/lib/config";
import { createGateCookie } from "@/lib/gate";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/dashboard");
  const config = demoConfig();

  if (token !== config.demoAccessToken) {
    return NextResponse.redirect(new URL("/unlock?error=invalid", request.url));
  }

  const response = NextResponse.redirect(new URL(returnTo.startsWith("/") ? returnTo : "/dashboard", request.url));
  response.cookies.set(gateCookieName, await createGateCookie(config.sessionSecret), {
    ...secureCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
