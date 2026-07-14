import type { NavigationDomainId, NavigationNode } from "@qentrah/domain-contracts";
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
  nodes: readonly NavigationNode[];
}>;

function node(
  domainId: NavigationDomainId,
  id: string,
  labelKey: string,
  iconId: string,
  routeId: string,
  options: { params?: Record<string, string>; required?: boolean } = {},
): NavigationNode {
  return {
    id,
    domainId,
    labelKey,
    iconId,
    routeId,
    params: options.params,
    nodeType: "route",
    required: options.required ?? false,
    opensPanel: false,
  };
}

/** Canonical product order. Unimplemented domains stay absent until real routes exist. */
export const IMPLEMENTED_NAVIGATION_CATALOG: readonly NavigationCatalogDomain[] = [
  {
    id: "home", labelKey: "home", iconId: "home", routeId: "ws", required: true, opensPanel: true, readResources: ["organization"],
    nodes: [
      node("home", "home.overview", "overview", "overview", "ws", { required: true }),
      node("home", "home.my-work", "myWork", "my-work", "tasks", { params: { filter: "my" }, required: true }),
      node("home", "home.attention", "needsAttention", "attention", "inbox"),
      node("home", "home.projects", "projects", "projects", "projects"),
    ],
  },
  {
    id: "inbox", labelKey: "inbox", iconId: "inbox", routeId: "inbox", required: true, opensPanel: true, readResources: ["channel"],
    nodes: [
      node("inbox", "inbox.primary", "primary", "inbox", "inbox", { required: true }),
      node("inbox", "inbox.channels", "channels", "channels", "channels", { required: true }),
    ],
  },
  {
    id: "spaces", labelKey: "spaces", iconId: "spaces", routeId: "spaces", required: true, opensPanel: true, readResources: ["space"],
    nodes: [node("spaces", "spaces.all", "allSpaces", "spaces", "spaces", { required: true })],
  },
  {
    id: "projects", labelKey: "projects", iconId: "projects", routeId: "projects", required: true, opensPanel: true, readResources: ["project"],
    nodes: [
      node("projects", "projects.all", "allProjects", "projects", "projects", { required: true }),
      node("projects", "projects.by-space", "projectsBySpace", "spaces", "spaces"),
    ],
  },
  {
    id: "tasks", labelKey: "tasks", iconId: "tasks", routeId: "tasks", required: true, opensPanel: true, readResources: ["task"],
    nodes: [
      node("tasks", "tasks.all", "allTasks", "tasks", "tasks", { required: true }),
      node("tasks", "tasks.mine", "myTasks", "my-work", "tasks", { params: { filter: "my" } }),
      node("tasks", "tasks.assigned-by-me", "assignedByMe", "assigned", "tasks", { params: { filter: "assigned" } }),
      node("tasks", "tasks.unassigned", "unassigned", "unassigned", "tasks", { params: { filter: "unassigned" } }),
      node("tasks", "tasks.overdue", "overdue", "overdue", "tasks", { params: { filter: "overdue" } }),
      node("tasks", "tasks.upcoming", "upcoming", "upcoming", "tasks", { params: { filter: "upcoming" } }),
      node("tasks", "tasks.completed", "completed", "completed", "tasks", { params: { filter: "completed" } }),
    ],
  },
  {
    id: "docs", labelKey: "docs", iconId: "docs", routeId: "docs", required: true, opensPanel: true, readResources: ["document"],
    nodes: [
      node("docs", "docs.all", "allDocs", "docs", "docs", { required: true }),
      node("docs", "docs.shared", "sharedWithMe", "shared", "docs", { params: { filter: "shared" } }),
      node("docs", "docs.recent", "recent", "recent", "docs", { params: { filter: "recent" } }),
      node("docs", "docs.templates", "templates", "templates", "docs", { params: { template: "true" } }),
    ],
  },
  {
    id: "calendar", labelKey: "calendar", iconId: "calendar", routeId: "calendar", required: true, opensPanel: true, readResources: ["calendar"],
    nodes: [node("calendar", "calendar.mine", "myCalendar", "calendar", "calendar", { required: true })],
  },
  {
    id: "crm", labelKey: "crm", iconId: "crm", routeId: "clients", required: true, opensPanel: true, readResources: ["client", "deal"], accessMode: "any",
    nodes: [
      node("crm", "crm.clients", "clients", "clients", "clients", { required: true }),
      node("crm", "crm.deals", "deals", "deals", "deals", { required: true }),
    ],
  },
  {
    id: "automations", labelKey: "automations", iconId: "automations", routeId: "automations", required: true, opensPanel: true, readResources: ["organization"],
    nodes: [node("automations", "automations.library", "automationLibrary", "automations", "automations", { required: true })],
  },
  {
    id: "ai", labelKey: "ai", iconId: "ai", routeId: "ai", required: true, opensPanel: true, readResources: ["organization"],
    nodes: [node("ai", "ai.conversations", "conversations", "ai", "ai", { required: true })],
  },
  {
    id: "admin", labelKey: "admin", iconId: "admin", routeId: "organization", required: true, opensPanel: true, readResources: ["organization"], requiredAction: "update",
    nodes: [
      node("admin", "admin.organization", "organization", "admin", "organization", { required: true }),
      node("admin", "admin.members", "membersAndTeams", "members", "team"),
      node("admin", "admin.permissions", "permissions", "permissions", "permissions"),
      node("admin", "admin.spaces", "spaceAdministration", "spaces", "organizationSpaces"),
      node("admin", "admin.integrations", "integrations", "integrations", "integrations"),
      node("admin", "admin.mcp", "mcpConnections", "mcp", "mcp"),
      node("admin", "admin.billing", "billing", "billing", "billing"),
      node("admin", "admin.usage", "usage", "usage", "usage"),
      node("admin", "admin.searchPolicy", "searchPolicy", "search", "searchPolicy"),
    ],
  },
] as const;
