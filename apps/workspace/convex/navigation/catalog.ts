import type { NavigationDomainId } from "@qentrah/domain-contracts";
import type { Resource } from "../permissions";

export type NavigationCatalogDomain = Readonly<{
  id: NavigationDomainId;
  labelKey: string;
  iconId: string;
  routeId: string;
  required: boolean;
  opensPanel: boolean;
  readResources: readonly Resource[];
  accessMode?: "any" | "all";
  requiredAction?: "read" | "update";
}>;

/** Canonical product order. Unimplemented domains stay absent until real routes exist. */
export const IMPLEMENTED_NAVIGATION_CATALOG: readonly NavigationCatalogDomain[] = [
  { id: "home", labelKey: "home", iconId: "home", routeId: "ws", required: true, opensPanel: true, readResources: ["organization"] },
  { id: "inbox", labelKey: "inbox", iconId: "inbox", routeId: "inbox", required: true, opensPanel: true, readResources: ["channel"] },
  { id: "spaces", labelKey: "spaces", iconId: "spaces", routeId: "spaces", required: true, opensPanel: true, readResources: ["space"] },
  { id: "projects", labelKey: "projects", iconId: "projects", routeId: "projects", required: true, opensPanel: true, readResources: ["project"] },
  { id: "tasks", labelKey: "tasks", iconId: "tasks", routeId: "tasks", required: true, opensPanel: true, readResources: ["task"] },
  { id: "docs", labelKey: "docs", iconId: "docs", routeId: "docs", required: true, opensPanel: true, readResources: ["document"] },
  { id: "calendar", labelKey: "calendar", iconId: "calendar", routeId: "calendar", required: true, opensPanel: true, readResources: ["calendar"] },
  { id: "crm", labelKey: "crm", iconId: "crm", routeId: "clients", required: true, opensPanel: true, readResources: ["client", "deal"], accessMode: "any" },
  { id: "automations", labelKey: "automations", iconId: "automations", routeId: "automations", required: true, opensPanel: false, readResources: ["organization"] },
  { id: "ai", labelKey: "ai", iconId: "ai", routeId: "ai", required: true, opensPanel: true, readResources: ["organization"] },
  { id: "admin", labelKey: "admin", iconId: "admin", routeId: "organization", required: true, opensPanel: true, readResources: ["organization"], requiredAction: "update" },
] as const;
