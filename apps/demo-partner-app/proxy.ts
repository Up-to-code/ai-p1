import { NextRequest, NextResponse } from "next/server";
import { gateCookieName } from "./lib/cookies";
import { isPublicPath, isValidGateCookie } from "./lib/gate";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const secret = process.env.SESSION_SECRET;
  const cookieValue = request.cookies.get(gateCookieName)?.value;
  const isUnlocked = secret ? await isValidGateCookie(cookieValue, secret) : false;
  if (isUnlocked) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  url.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
