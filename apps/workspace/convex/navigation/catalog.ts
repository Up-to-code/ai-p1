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

/** Canonical product order. Rollout and authorization decide which domains reach a caller. */
export const IMPLEMENTED_NAVIGATION_CATALOG: readonly NavigationCatalogDomain[] = [
  {
    id: "home", labelKey: "home", iconId: "home", routeId: "ws", required: true, opensPanel: true, readResources: ["organization"],
    nodes: [
      node("home", "home.overview", "overview", "overview", "ws", { required: true }),
      node("home", "home.my-work", "myWork", "my-work", "tasks", { params: { filter: "my" }, required: true }),
      node("home", "home.attention", "needsAttention", "attention", "inbox"),
      node("home", "home.deadlines", "upcomingDeadlines", "upcoming", "tasks", { params: { filter: "upcoming" } }),
      node("home", "home.recent", "recent", "recent", "search", { params: { view: "recent" } }),
      node("home", "home.favorites", "favorites", "completed", "projects", { params: { filter: "favorites" } }),
      node("home", "home.dashboards", "personalDashboards", "overview", "ws", { params: { view: "dashboards" } }),
    ],
  },
  {
    id: "inbox", labelKey: "inbox", iconId: "inbox", routeId: "inbox", required: true, opensPanel: true, readResources: ["channel"],
    nodes: [
      node("inbox", "inbox.attention", "inbox", "inbox", "inbox", { required: true }),
      node("inbox", "inbox.replies", "replies", "replies", "inboxReplies", { required: true }),
      node("inbox", "inbox.assigned-comments", "assignedComments", "comments", "inboxAssignedComments", { required: true }),
      node("inbox", "inbox.my-tasks", "myTasks", "my-work", "tasks", { params: { filter: "my" }, required: true }),
      node("inbox", "inbox.channels", "channels", "channels", "channels", { required: true }),
    ],
  },
  {
    id: "projects", labelKey: "projects", iconId: "projects", routeId: "projects", required: true, opensPanel: true, readResources: ["project"],
    nodes: [
      node("projects", "projects.portfolio", "portfolio", "overview", "projects", { params: { view: "portfolio" }, required: true }),
      node("projects", "projects.all", "allProjects", "projects", "projects", { required: true }),
      node("projects", "projects.mine", "myProjects", "my-work", "projects", { params: { filter: "my" } }),
      node("projects", "projects.risk", "atRisk", "attention", "projects", { params: { filter: "at-risk" } }),
      node("projects", "projects.recent", "recentlyUpdated", "recent", "projects", { params: { sort: "updated" } }),
      node("projects", "projects.templates", "templates", "templates", "projects", { params: { view: "templates" } }),
      node("projects", "projects.archived", "archived", "recent", "projects", { params: { filter: "archived" } }),
    ],
  },
  {
    id: "tasks", labelKey: "tasks", iconId: "tasks", routeId: "tasks", required: true, opensPanel: true, readResources: ["task"],
    nodes: [
      node("tasks", "tasks.all", "allTasks", "tasks", "tasks", { required: true }),
      node("tasks", "tasks.mine", "myTasks", "my-work", "tasks", { params: { filter: "my" } }),
      node("tasks", "tasks.assigned-by-me", "assignedByMe", "assigned", "tasks", { params: { filter: "assigned" } }),
      node("tasks", "tasks.created-by-me", "createdByMe", "my-work", "tasks", { params: { filter: "created" } }),
      node("tasks", "tasks.unassigned", "unassigned", "unassigned", "tasks", { params: { filter: "unassigned" } }),
      node("tasks", "tasks.overdue", "overdue", "overdue", "tasks", { params: { filter: "overdue" } }),
      node("tasks", "tasks.upcoming", "upcoming", "upcoming", "tasks", { params: { filter: "upcoming" } }),
      node("tasks", "tasks.completed", "completed", "completed", "tasks", { params: { filter: "completed" } }),
      node("tasks", "tasks.saved-views", "savedViews", "overview", "tasks", { params: { view: "saved" } }),
      node("tasks", "tasks.forms", "forms", "docs", "tasks", { params: { view: "form" } }),
      node("tasks", "tasks.templates", "templates", "templates", "tasks", { params: { view: "templates" } }),
    ],
  },
  {
    id: "docs", labelKey: "docs", iconId: "docs", routeId: "docs", required: true, opensPanel: true, readResources: ["document"],
    nodes: [
      node("docs", "docs.all", "allDocs", "docs", "docs", { required: true }),
      node("docs", "docs.mine", "myDocuments", "my-work", "docs", { params: { filter: "my" } }),
      node("docs", "docs.shared", "sharedWithMe", "shared", "docs", { params: { filter: "shared" } }),
      node("docs", "docs.recent", "recent", "recent", "docs", { params: { filter: "recent" } }),
      node("docs", "docs.favorites", "favorites", "completed", "docs", { params: { filter: "favorites" } }),
      node("docs", "docs.templates", "templates", "templates", "docs", { params: { template: "true" } }),
      node("docs", "docs.folders", "folders", "spaces", "docs", { params: { view: "folders" } }),
      node("docs", "docs.space", "spaceDocuments", "spaces", "docs", { params: { scope: "space" } }),
      node("docs", "docs.project", "projectDocuments", "projects", "docs", { params: { scope: "project" } }),
      node("docs", "docs.archived", "archived", "recent", "docs", { params: { filter: "archived" } }),
    ],
  },
  {
    id: "calendar", labelKey: "calendar", iconId: "calendar", routeId: "calendar", required: true, opensPanel: true, readResources: ["calendar"],
    nodes: [
      node("calendar", "calendar.mine", "myCalendar", "calendar", "calendar", { required: true }),
      node("calendar", "calendar.team", "teamCalendar", "members", "calendar", { params: { view: "team" } }),
      node("calendar", "calendar.spaces", "spaceCalendars", "spaces", "calendar", { params: { view: "spaces" } }),
      node("calendar", "calendar.projects", "projectCalendars", "projects", "calendar", { params: { view: "projects" } }),
      node("calendar", "calendar.milestones", "milestones", "completed", "calendar", { params: { view: "milestones" } }),
      node("calendar", "calendar.saved", "savedCalendarViews", "overview", "calendar", { params: { view: "saved" } }),
    ],
  },
  {
    id: "automations", labelKey: "automations", iconId: "automations", routeId: "automations", required: true, opensPanel: true, readResources: ["organization"],
    nodes: [
      node("automations", "automations.coming-soon", "comingSoon", "automations", "automations", { required: true }),
    ],
  },
  {
    id: "admin", labelKey: "admin", iconId: "admin", routeId: "organization", required: true, opensPanel: true, readResources: ["organization"], requiredAction: "update",
    nodes: [
      node("admin", "admin.organization", "organization", "admin", "organization", { required: true }),
      node("admin", "admin.members", "members", "members", "organization", { params: { tab: "members" } }),
      node("admin", "admin.teams-roles", "teamsAndRoles", "members", "team"),
      node("admin", "admin.spaces", "spaces", "spaces", "organizationSpaces"),
      node("admin", "admin.permissions", "permissions", "permissions", "permissions"),
      node("admin", "admin.workflows-statuses", "workflowsAndStatuses", "automations", "adminConfig", { params: { view: "workflows-statuses" } }),
      node("admin", "admin.custom-fields", "customFields", "tags", "adminConfig", { params: { view: "custom-fields" } }),
      node("admin", "admin.templates", "templates", "templates", "adminConfig", { params: { view: "templates" } }),
      node("admin", "admin.portal-branding", "clientPortalBranding", "delivery", "adminConfig", { params: { view: "portal-branding" } }),
      node("admin", "admin.notifications", "notifications", "inbox", "organization", { params: { tab: "notifications" } }),
      node("admin", "admin.integrations", "integrations", "integrations", "integrations"),
      node("admin", "admin.api-keys", "apiKeys", "permissions", "organization", { params: { tab: "apiKeys" } }),
      node("admin", "admin.mcp", "mcpConnections", "mcp", "mcp"),
      node("admin", "admin.billing", "billingEntitlements", "billing", "billing"),
      node("admin", "admin.security", "security", "permissions", "adminConfig", { params: { view: "security" } }),
      node("admin", "admin.audit", "auditLog", "recent", "organizationActivity"),
      node("admin", "admin.import-export", "dataImportExport", "docs", "adminConfig", { params: { view: "import-export" } }),
      node("admin", "admin.searchPolicy", "searchPolicy", "search", "searchPolicy"),
      node("admin", "admin.retention", "retention", "calendar", "adminConfig", { params: { view: "retention" } }),
      node("admin", "admin.features", "featureConfiguration", "admin", "adminConfig", { params: { view: "features" } }),
    ],
  },
] as const;
