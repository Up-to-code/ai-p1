import createMiddleware from "next-intl/middleware";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const PROTECTED_PATTERNS = [
  /^\/(ar|en)\/(ai|inbox|dashboard|projects|tasks|calendar|clients|docs|settings|organization|ws)(\/|$)/,
];

// Routes accessible without authentication
const AUTH_PATTERNS = [
  /^\/(ar|en)\/(sign-in|sign-up|sso-callback)(\/|$)/,
];

/** Read the Better Auth session cookie from the request (edge-safe, no next/headers). */
function hasSessionCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  // Better Auth sets `better-auth.session_token` (or prefixed variants for secure envs).
  return (
    cookieHeader.includes("better-auth.session_token=") ||
    cookieHeader.includes("__Secure-better-auth.session_token=") ||
    cookieHeader.includes("__Host-better-auth.session_token=")
  );
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((p) => p.test(pathname));
}

function isPublicAuth(pathname: string): boolean {
  return AUTH_PATTERNS.some((p) => p.test(pathname));
}

export default function middleware(request: NextRequest) {
  const startedAt = Date.now();
  const route = request.nextUrl.pathname;

  try {
    // Eve agent routes, MCP, and .well-known pass through without auth
    if (
      route.startsWith("/eve/") ||
      route.startsWith("/_eve_internal/") ||
      route.startsWith("/mcp/") ||
      route.startsWith("/.well-known/")
    ) {
      return NextResponse.next();
    }

    // API routes — pass through without i18n so Hono can serve them
    if (route.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Localized Eve routes rewrite to the non-localized path
    const localizedEveMatch = route.match(/^\/(ar|en)(\/(?:eve|_eve_internal)\/.*)$/);
    if (localizedEveMatch) {
      const url = request.nextUrl.clone();
      url.pathname = localizedEveMatch[2];
      return NextResponse.rewrite(url);
    }

    // Public auth routes — pass through to next-intl (no auth guard needed)
    if (isPublicAuth(route)) {
      return intlMiddleware(request);
    }

    // Protected routes — check for a session cookie
    if (isProtected(route) && !hasSessionCookie(request)) {
      // Derive the locale from the path (default to "en")
      const localeMatch = route.match(/^\/(ar|en)\//);
      const locale = localeMatch ? localeMatch[1] : "en";
      const callbackURL = encodeURIComponent(`${route}${request.nextUrl.search}`);
      const signInUrl = new URL(
        `/${locale}/sign-in?callbackURL=${callbackURL}`,
        request.url,
      );
      return NextResponse.redirect(signInUrl);
    }

    // All other routes — apply next-intl
    return intlMiddleware(request);
  } finally {
    const attributes = { route, method: request.method };
    Sentry.metrics.count("next.proxy.requests", 1, { attributes });
    Sentry.metrics.distribution("next.proxy.duration", Date.now() - startedAt, {
      unit: "millisecond",
      attributes,
    });
  }
}

export const config = {
  matcher: [
    // Match all routes except static files and public assets
    "/((?!_next/static|_next/image|favicon.ico|ai/|images/|icons/|eve/|_eve_internal/|mcp/|\\.well-known/|.*\\..*).*)",
  ],
};
