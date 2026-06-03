import createMiddleware from 'next-intl/middleware';
import type { NextFetchEvent, NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { authkitProxy } from "@workos-inc/authkit-nextjs";
import {routing} from './i18n/routing';
import { applyWorkOSProxyHeaders } from "./proxy-headers";

const intlMiddleware = createMiddleware(routing);
const workosRedirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI ?? "http://localhost:3000/callback";
const workosProxy = authkitProxy({
  redirectUri: workosRedirectUri,
  eagerAuth: true,
  middlewareAuth: {
    enabled: false,
    unauthenticatedPaths: [],
  },
});

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

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const startedAt = Date.now();
  const route = getRouteMetric(request.nextUrl.pathname);

  try {
    const workosResponse = await workosProxy(request, event);
    if (request.nextUrl.pathname.startsWith("/api/") || request.nextUrl.pathname === "/callback") {
      return workosResponse;
    }
    const intlResponse = intlMiddleware(request);
    return workosResponse ? applyWorkOSProxyHeaders(intlResponse, workosResponse.headers) : intlResponse;
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
    "/callback",
    "/api/:path*",
  ],
};
