import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
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
  "properties",
  "settings",
  "team",
  "usage",
  "web-apps",
]);

function isProtectedRoute(request: NextRequest) {
  const [locale, segment] = request.nextUrl.pathname.split("/").filter(Boolean);
  return (locale === "ar" || locale === "en") && protectedRouteSegments.has(segment ?? "");
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
    if (isProtectedRoute(request)) {
      await auth.protect({
        unauthenticatedUrl: new URL(`/${locale}/sign-in`, request.url).toString(),
      });
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
