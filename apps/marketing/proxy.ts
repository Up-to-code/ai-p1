import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = "qentrah.com";
const CANONICAL_HOST = `www.${ROOT_DOMAIN}`;
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  const normalizedHost = hostname.split(":")[0].toLowerCase();

  if (normalizedHost === ROOT_DOMAIN) {
    const dest = new URL(`${CANONICAL_ORIGIN}${pathname}${search}`);
    return NextResponse.redirect(dest, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
