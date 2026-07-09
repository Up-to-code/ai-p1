export type RailItemId =
  | "home"
  | "ws"
  | "ai"
  | "spaces"
  | "tasks"
  | "calendar"
  | "clients"
  | "opportunities"
  | "deals"
  | "docs"
  | "inbox"
  | null;

export const ROUTE_IDS = [
  "ws",
  "ai",
  "tasks",
  "calendar",
  "docs",
  "clients",
  "opportunities",
  "deals",
  "channels",
  "inbox",
  "spaces",
  "projects",
  "organization",
] as const;

export type RouteId = (typeof ROUTE_IDS)[number];

export interface RouteCatalogEntry {
  id: RouteId;
  path: `/${string}`;
  persistentParams: readonly string[];
  railItem: RailItemId;
  aliases?: readonly string[];
}

const contextParams = ["project", "space"] as const;
const aiParams = ["mode", "threadId", "state"] as const;

export const ROUTE_CATALOG: readonly RouteCatalogEntry[] = [
  { id: "ws", path: "/ws", persistentParams: [], railItem: "home" },
  { id: "ai", path: "/ai", persistentParams: aiParams, railItem: "ai" },
  { id: "tasks", path: "/tasks", persistentParams: contextParams, railItem: "tasks" },
  { id: "calendar", path: "/calendar", persistentParams: contextParams, railItem: "calendar" },
  { id: "docs", path: "/docs", persistentParams: contextParams, railItem: "docs" },
  { id: "clients", path: "/clients", persistentParams: [], railItem: "clients" },
  { id: "opportunities", path: "/opportunities", persistentParams: [], railItem: "opportunities" },
  { id: "deals", path: "/deals", persistentParams: [], railItem: "deals" },
  { id: "channels", path: "/channels", persistentParams: contextParams, railItem: "inbox", aliases: ["/ws/channels", "/inbox/channels", "/organization/channels"] },
  { id: "inbox", path: "/inbox", persistentParams: [], railItem: "inbox", aliases: ["/ws/inbox"] },
  { id: "spaces", path: "/spaces", persistentParams: [], railItem: "spaces", aliases: ["/ws/spaces", "/inbox/spaces", "/organization/spaces"] },
  { id: "projects", path: "/projects", persistentParams: [], railItem: "spaces" },
  { id: "organization", path: "/organization", persistentParams: [], railItem: null },
];

const locales = new Set(["en", "ar"]);

function normalizePath(pathname: string): string | null {
  if (!pathname || pathname.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(pathname)) return null;
  const path = pathname.split("?", 1)[0].split("#", 1)[0];
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0 && locales.has(segments[0])) segments.shift();
  return `/${segments.join("/")}` || "/";
}

function matches(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function getRouteEntry(pathname: string): RouteCatalogEntry | null {
  const normalized = normalizePath(pathname);
  if (!normalized) return null;
  // Aliases win over a broader canonical parent, e.g. /inbox/channels is channels.
  return ROUTE_CATALOG.find((entry) => entry.aliases?.some((alias) => matches(normalized, alias)))
    ?? ROUTE_CATALOG.find((entry) => matches(normalized, entry.path))
    ?? null;
}

export function getRouteId(pathname: string): RouteId | null {
  return getRouteEntry(pathname)?.id ?? null;
}

export function getActiveRailItem(pathname: string): RailItemId {
  return getRouteEntry(pathname)?.railItem ?? null;
}

export function getSupportedPersistentParams(pathname: string): readonly string[] {
  return getRouteEntry(pathname)?.persistentParams ?? [];
}

export function isInternalHref(href: string): boolean {
  return Boolean(href) && !href.startsWith("//") && !/^[a-z][a-z\d+.-]*:/i.test(href) && !href.startsWith("#");
}
