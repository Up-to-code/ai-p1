import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const protectedRouteSegments = new Set([
  "activity",
  "billing",
  "calendar",
  "clients",
  "dashboard",
  "integrations",
  "organization",
  "profile",
  "projects",
  "assets",
  "settings",
  "team",
  "usage",
  "web-apps",
]);

// Auth routes that should redirect authenticated users
const isAuthRoute = createRouteMatcher([
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/:locale/sso-callback(.*)',
]);

function isProtectedRoute(request: NextRequest) {
  const [locale, segment] = request.nextUrl.pathname.split("/").filter(Boolean);
  return (locale === "ar" || locale === "en") && protectedRouteSegments.has(segment ?? "");
}

function isApiRoute(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/api/");
}

function getRouteMetric(pathname: string) {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(0, 3)
    .map((segment, index) => {
      if (index === 0 && (segment === "ar" || segment === "en")) {
        return ":locale";
      }

      return /^\d+$|^[a-f0-9]{8,}$|^[A-Za-z0-9_-]{16,}$/.test(segment)
        ? ":id"
        : segment;
    });

  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const startedAt = Date.now();
  const route = getRouteMetric(request.nextUrl.pathname);
  const locale = request.nextUrl.pathname.split("/").filter(Boolean)[0] ?? routing.defaultLocale;

  try {
    // Skip auth for API routes
    if (isApiRoute(request)) {
      return NextResponse.next();
    }

    // Get auth state
    const { userId, orgId } = await auth();

    // Handle auth routes (sign-in, sign-up, sso-callback)
    if (isAuthRoute(request)) {
      if (userId) {
        // User is authenticated, redirect to appropriate page
        if (orgId) {
          // Has organization, go to dashboard
          return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
        } else {
          // No organization, go to org selection
          return NextResponse.redirect(new URL(`/${locale}/choose-org`, request.url));
        }
      }
      // Not signed in, allow access to auth pages
      return intlMiddleware(request);
    }

    // Handle protected routes
    if (isProtectedRoute(request)) {
      // Protect the route - this will redirect to sign-in if not authenticated
      await auth.protect({
        unauthenticatedUrl: new URL(`/${locale}/sign-in`, request.url).toString(),
      });

      // Check if user needs to select an organization
      const segment = request.nextUrl.pathname.split("/").filter(Boolean)[1];
      if (!orgId && segment !== "choose-org") {
        return NextResponse.redirect(new URL(`/${locale}/choose-org`, request.url));
      }
    }

    return intlMiddleware(request);
  } finally {
    const attributes = { route, method: request.method };

    Sentry.metrics.count("next.proxy.requests", 1, { attributes });
    Sentry.metrics.distribution("next.proxy.duration", Date.now() - startedAt, {
      unit: "millisecond",
      attributes,
    });
  }
});
 
export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/about",
    "/terms",
    "/privacy",
    "/legal",
    "/contact",
    "/developer",
    "/broker",
    "/docs",
    "/docs/:path*",
    "/api/v1/:path*",
    "/api/uploadthing",
  ],
};
