import createMiddleware from "next-intl/middleware";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  buildSignInPath,
  classifyWorkspaceRoute,
  getSubdomainLabel,
  isLocalizedWorkspaceRoot,
  localizedEvePath,
  splitLocalizedPath,
} from "./domains/navigation/workspace-route-policy";
import { resolveWorkspaceAuthEntry } from "./domains/auth/utils/workspace-auth-entry";
import { resolveSubdomainPath } from "./lib/subdomain-routing";

const intlMiddleware = createMiddleware(routing);

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

function resolveSubdomainRewrite(request: NextRequest): URL | null {
  const label = getSubdomainLabel(
    request.headers.get("host") ?? request.nextUrl.hostname,
  );
  const { locale, pathname } = splitLocalizedPath(request.nextUrl.pathname);
  const targetPath = resolveSubdomainPath(label, locale, pathname);
  if (!targetPath) return null;

  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  return url;
}

export default function middleware(request: NextRequest) {
  const startedAt = Date.now();
  const route = request.nextUrl.pathname;
  const routeClass = classifyWorkspaceRoute(route);

  try {
    if (routeClass === "bypass") return NextResponse.next();

    // Resolve the localized app root before React renders. A route whose only
    // job is throwing a Server Component redirect produces invalid Turbopack
    // component performance marks during development.
    if (isLocalizedWorkspaceRoot(route)) {
      const { locale } = splitLocalizedPath(route);
      const target = resolveWorkspaceAuthEntry(locale, hasSessionCookie(request));
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Auth entry routes must be handled before a subdomain rewrite. Otherwise,
    // `app.qentrah.com/en/sign-in` becomes `/en/ws/sign-in`, which is protected
    // and redirects back to sign-in with an increasingly nested callback URL.
    if (routeClass === "public-auth") {
      return intlMiddleware(request);
    }

    const subdomainRewrite = resolveSubdomainRewrite(request);
    if (subdomainRewrite) {
      if (
        classifyWorkspaceRoute(subdomainRewrite.pathname) === "protected" &&
        !hasSessionCookie(request)
      ) {
        const signInUrl = new URL(buildSignInPath(
          subdomainRewrite.pathname,
          request.nextUrl.search,
        ), request.url);
        return NextResponse.redirect(signInUrl);
      }

      return NextResponse.rewrite(subdomainRewrite);
    }

    // Localized Eve routes rewrite to the non-localized path
    const evePath = localizedEvePath(route);
    if (evePath) {
      const url = request.nextUrl.clone();
      url.pathname = evePath;
      return NextResponse.rewrite(url);
    }

    // Protected routes — check for a session cookie
    if (routeClass === "protected" && !hasSessionCookie(request)) {
      const signInUrl = new URL(
        buildSignInPath(route, request.nextUrl.search),
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
    "/((?!_next/static|_next/image|favicon.ico|ai/|images/|icons/|eve/|_eve_internal/|mcp(?:/|$)|oauth/|\\.well-known/|.*\\..*).*)",
  ],
};
