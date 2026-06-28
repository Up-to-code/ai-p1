import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedRouteSegments = new Set([
  "activity",
  "billing",
  "calendar",
  "clients",
  "dashboard",
  "integrations",
  "onboarding",
  "organization",
  "profile",
  "projects",
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
    const { userId } = await auth();

    // Handle auth routes (sign-in, sign-up, sso-callback)
    if (isAuthRoute(request)) {
      if (userId) {
        // User is authenticated, redirect to workspace.
        // The DashboardAppWrapper will show a modal if no organization exists.
        return NextResponse.redirect(new URL(`/${locale}/ws`, request.url));
      }
      // Not signed in, allow access to auth pages
      return intlMiddleware(request);
    }

    // Handle protected routes
    if (isProtectedRoute(request)) {
      await auth.protect({
        unauthenticatedUrl: new URL(`/${locale}/sign-in`, request.url).toString(),
      });

      // NOTE: We no longer redirect to /choose-org here.
      // The DashboardAppWrapper shows a modal for users without an organization,
      // avoiding the glitch between auth and organization selection.
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
    "/mcp-docs",
    "/mcp-docs/:path*",
    "/api/v1/:path*",
    "/api/uploadthing",
  ],
};
