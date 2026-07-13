import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/i18n/locale-registry";

export type WorkspaceRouteClass =
  | "bypass"
  | "public-auth"
  | "protected"
  | "localized-eve"
  | "localized-public";

const protectedSegments = new Set([
  "activity",
  "ai",
  "automations",
  "billing",
  "calendar",
  "channels",
  "clients",
  "deals",
  "docs",
  "inbox",
  "integrations",
  "mcp",
  "opportunities",
  "organization",
  "profile",
  "projects",
  "settings",
  "spaces",
  "tasks",
  "team",
  "theories",
  "time-tracking",
  "usage",
  "web-apps",
  "ws",
]);

const publicAuthSegments = new Set([
  "accept-invite",
  "choose-org",
  "onboarding",
  "sign-in",
  "sign-up",
  "sso-callback",
  "verify-email",
]);

const bypassPrefixes = [
  "/api/",
  "/eve/",
  "/_eve_internal/",
  "/mcp/",
  "/oauth/",
  "/.well-known/",
] as const;

export interface LocalizedPath {
  locale: Locale;
  pathname: string;
  hadLocale: boolean;
}

export function splitLocalizedPath(pathname: string): LocalizedPath {
  const segments = pathname.split("/");
  const candidate = segments[1] ?? "";

  if (!isLocale(candidate)) {
    return { locale: DEFAULT_LOCALE, pathname, hadLocale: false };
  }

  return {
    locale: candidate,
    pathname: `/${segments.slice(2).join("/")}`.replace(/\/$/, "") || "/",
    hadLocale: true,
  };
}

function firstSegment(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "";
}

export function classifyWorkspaceRoute(pathname: string): WorkspaceRouteClass {
  if (
    pathname === "/mcp" ||
    bypassPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return "bypass";
  }

  const localized = splitLocalizedPath(pathname);
  if (
    localized.hadLocale &&
    (localized.pathname.startsWith("/eve/") ||
      localized.pathname.startsWith("/_eve_internal/"))
  ) {
    return "localized-eve";
  }

  if (!localized.hadLocale) return "localized-public";

  const segment = firstSegment(localized.pathname);
  if (publicAuthSegments.has(segment)) return "public-auth";
  if (protectedSegments.has(segment)) return "protected";
  return "localized-public";
}

export function localizedEvePath(pathname: string): string | null {
  const localized = splitLocalizedPath(pathname);
  return localized.hadLocale &&
    (localized.pathname.startsWith("/eve/") ||
      localized.pathname.startsWith("/_eve_internal/"))
    ? localized.pathname
    : null;
}

/** True only for a locale-prefixed workspace entry such as `/en` or `/ar/`. */
export function isLocalizedWorkspaceRoot(pathname: string): boolean {
  const localized = splitLocalizedPath(pathname);
  return localized.hadLocale && localized.pathname === "/";
}

export function getSubdomainLabel(hostname: string): string | null {
  const host = hostname.split(":")[0] ?? "";
  const parts = host.split(".").filter(Boolean);

  if (host.endsWith(".localhost") && parts.length > 1) return parts[0] ?? null;
  if (parts.length < 3) return null;

  const label = parts[0];
  return label === "www" ? null : label;
}

export function buildSignInPath(pathname: string, search = ""): string {
  const { locale } = splitLocalizedPath(pathname);
  const callbackURL = encodeURIComponent(`${pathname}${search}`);
  return `/${locale}/sign-in?callbackURL=${callbackURL}`;
}

export const workspaceRoutePolicy = {
  classify: classifyWorkspaceRoute,
  splitLocalizedPath,
  localizedEvePath,
  isLocalizedWorkspaceRoot,
  getSubdomainLabel,
  buildSignInPath,
} as const;
