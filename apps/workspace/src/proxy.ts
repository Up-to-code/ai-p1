import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Create route matcher for protected routes
const isProtectedRoute = createRouteMatcher([
  '/(ar|en)/ai/:path*',
  '/(ar|en)/inbox/:path*',
  '/(ar|en)/dashboard/:path*',
  '/(ar|en)/projects/:path*',
  '/(ar|en)/tasks/:path*',
  '/(ar|en)/calendar/:path*',
  '/(ar|en)/clients/:path*',
  '/(ar|en)/docs/:path*',
  '/(ar|en)/settings/:path*',
  '/(ar|en)/organization/:path*',
  '/(ar|en)/ws/:path*',
]);

// Create route matcher for public routes (auth pages)
const isPublicRoute = createRouteMatcher([
  '/(ar|en)/sign-in(.*)',
  '/(ar|en)/sign-up(.*)',
  '/(ar|en)/sso-callback(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const startedAt = Date.now();
  const route = request.nextUrl.pathname;
  const requestForMetrics = request;

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

    // API routes — pass through without i18n handling so Hono can serve them
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

    // Public auth routes — pass through to next-intl
    if (isPublicRoute(request)) {
      return intlMiddleware(request);
    }

    // Protected routes — use auth.protect() for v5 auto-redirect
    if (isProtectedRoute(request)) {
      await auth.protect();
    }

    // All other routes
    return intlMiddleware(request);
  } finally {
    const attributes = { route, method: requestForMetrics.method };

    Sentry.metrics.count("next.proxy.requests", 1, { attributes });
    Sentry.metrics.distribution("next.proxy.duration", Date.now() - startedAt, {
      unit: "millisecond",
      attributes,
    });
  }
});

export const config = {
  matcher: [
    // Match all routes except static files and public assets
    "/((?!_next/static|_next/image|favicon.ico|ai/|images/|icons/|eve/|_eve_internal/|mcp/|\\.well-known/).*)",
  ],
};
