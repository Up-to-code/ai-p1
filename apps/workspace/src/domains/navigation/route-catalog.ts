import { isLocale } from "@/i18n/locale-registry";

import type { NavigationDomainId } from "@qentrah/domain-contracts";

export type RailItemId = NavigationDomainId | null;

export const ROUTE_IDS = [
  "ws",
  "ai",
  "tasks",
  "calendar",
  "docs",
  "clients",
  "deals",
  "channels",
  "inbox",
  "spaces",
  "projects",
  "organization",
  "automations",
  "team",
  "billing",
  "usage",
  "integrations",
  "mcp",
  "permissions",
  "organizationSpaces",
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
const dealParams = ["filter", "sort"] as const;
const taskParams = ["filter", "project", "space"] as const;

export const ROUTE_CATALOG: readonly RouteCatalogEntry[] = [
  { id: "ws", path: "/ws", persistentParams: [], railItem: "home" },
  { id: "ai", path: "/ai", persistentParams: aiParams, railItem: "ai" },
  { id: "tasks", path: "/tasks", persistentParams: taskParams, railItem: "tasks" },
  { id: "calendar", path: "/calendar", persistentParams: contextParams, railItem: "calendar" },
  { id: "docs", path: "/docs", persistentParams: contextParams, railItem: "docs" },
  { id: "clients", path: "/clients", persistentParams: [], railItem: "crm" },
  { id: "deals", path: "/deals", persistentParams: dealParams, railItem: "crm", aliases: ["/opportunities"] },
  { id: "channels", path: "/channels", persistentParams: contextParams, railItem: "inbox", aliases: ["/ws/channels", "/inbox/channels", "/organization/channels"] },
  { id: "inbox", path: "/inbox", persistentParams: [], railItem: "inbox", aliases: ["/ws/inbox"] },
  { id: "spaces", path: "/spaces", persistentParams: [], railItem: "spaces", aliases: ["/ws/spaces", "/inbox/spaces", "/organization/spaces"] },
  { id: "projects", path: "/projects", persistentParams: [], railItem: "projects" },
  { id: "organization", path: "/organization", persistentParams: [], railItem: "admin" },
  { id: "automations", path: "/automations", persistentParams: [], railItem: "automations" },
  { id: "team", path: "/team", persistentParams: [], railItem: "admin" },
  { id: "billing", path: "/billing", persistentParams: [], railItem: "admin" },
  { id: "usage", path: "/usage", persistentParams: [], railItem: "admin" },
  { id: "integrations", path: "/web-apps", persistentParams: [], railItem: "admin", aliases: ["/integrations"] },
  { id: "mcp", path: "/mcp", persistentParams: [], railItem: "admin" },
  { id: "permissions", path: "/organization/custom-permissions", persistentParams: [], railItem: "admin" },
  { id: "organizationSpaces", path: "/organization/spaces", persistentParams: [], railItem: "admin" },
];

function normalizePath(pathname: string): string | null {
  if (!pathname || pathname.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(pathname)) return null;
  const path = pathname.split("?", 1)[0].split("#", 1)[0];
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0] ?? "")) segments.shift();
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

export function getRoutePath(routeId: RouteId): `/${string}` {
  return ROUTE_CATALOG.find((entry) => entry.id === routeId)?.path ?? "/ws";
}

export function getRoutePathById(routeId: string): `/${string}` {
  return ROUTE_CATALOG.find((entry) => entry.id === routeId)?.path ?? "/ws";
}

export function isInternalHref(href: string): boolean {
  return Boolean(href) && !href.startsWith("//") && !/^[a-z][a-z\d+.-]*:/i.test(href) && !href.startsWith("#");
}
