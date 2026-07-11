import createMiddleware from "next-intl/middleware";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const SUPPORTED_LOCALES = new Set(["ar", "en"]);
const DEFAULT_LOCALE = "en";

// Routes that require authentication
const PROTECTED_PATTERNS = [
  /^\/(ar|en)\/(ai|inbox|dashboard|projects|tasks|calendar|clients|docs|settings|organization|ws)(\/|$)/,
];

// Routes accessible without authentication
const AUTH_PATTERNS = [
  /^\/(ar|en)\/(sign-in|sign-up|sso-callback|choose-org|verify-email|accept-invite|onboarding)(\/|$)/,
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

function getSubdomainLabel(hostname: string): string | null {
  const host = hostname.split(":")[0] ?? "";
  const parts = host.split(".").filter(Boolean);

  if (host.endsWith(".localhost") && parts.length > 1) return parts[0] ?? null;
  if (parts.length < 3) return null;

  const label = parts[0];
  return label === "www" ? null : label;
}

function stripLocale(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (SUPPORTED_LOCALES.has(maybeLocale)) {
    return {
      locale: maybeLocale,
      pathname: `/${segments.slice(2).join("/")}`.replace(/\/$/, "") || "/",
    };
  }

  return { locale: DEFAULT_LOCALE, pathname };
}

function resolveSubdomainRewrite(request: NextRequest): URL | null {
  const label = getSubdomainLabel(
    request.headers.get("host") ?? request.nextUrl.hostname,
  );
  if (!label) return null;

  const { locale, pathname } = stripLocale(request.nextUrl.pathname);
  const url = request.nextUrl.clone();

  if (label === "inbox") {
    url.pathname = `/${locale}/inbox${pathname === "/" ? "" : pathname}`;
    return url;
  }

  if (label === "ws" || label === "app") {
    url.pathname = `/${locale}/ws${pathname === "/" ? "" : pathname}`;
    return url;
  }

  if (label === "admin") {
    url.pathname = `/${locale}/organization${
      pathname === "/" ? "" : pathname
    }`;
    return url;
  }

  if (label === "ai") {
    url.pathname = `/${locale}/ai${pathname === "/" ? "" : pathname}`;
    return url;
  }

  return null;
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

    // Auth entry routes must be handled before a subdomain rewrite. Otherwise,
    // `app.qentrah.com/en/sign-in` becomes `/en/ws/sign-in`, which is protected
    // and redirects back to sign-in with an increasingly nested callback URL.
    if (isPublicAuth(route)) {
      return intlMiddleware(request);
    }

    const subdomainRewrite = resolveSubdomainRewrite(request);
    if (subdomainRewrite) {
      if (
        isProtected(subdomainRewrite.pathname) &&
        !hasSessionCookie(request)
      ) {
        const localeMatch = subdomainRewrite.pathname.match(/^\/(ar|en)\//);
        const locale = localeMatch ? localeMatch[1] : DEFAULT_LOCALE;
        const callbackURL = encodeURIComponent(
          `${subdomainRewrite.pathname}${request.nextUrl.search}`,
        );
        const signInUrl = new URL(
          `/${locale}/sign-in?callbackURL=${callbackURL}`,
          request.url,
        );
        return NextResponse.redirect(signInUrl);
      }

      return NextResponse.rewrite(subdomainRewrite);
    }

    // Localized Eve routes rewrite to the non-localized path
    const localizedEveMatch = route.match(
      /^\/(ar|en)(\/(?:eve|_eve_internal)\/.*)$/,
    );
    if (localizedEveMatch) {
      const url = request.nextUrl.clone();
      url.pathname = localizedEveMatch[2];
      return NextResponse.rewrite(url);
    }

    // Protected routes — check for a session cookie
    if (isProtected(route) && !hasSessionCookie(request)) {
      // Derive the locale from the path (default to "en")
      const localeMatch = route.match(/^\/(ar|en)\//);
      const locale = localeMatch ? localeMatch[1] : "en";
      const callbackURL = encodeURIComponent(
        `${route}${request.nextUrl.search}`,
      );
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
