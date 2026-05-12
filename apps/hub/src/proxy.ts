import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

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

export default function proxy(request: NextRequest) {
  const startedAt = Date.now();
  const route = getRouteMetric(request.nextUrl.pathname);

  try {
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
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*']
};
