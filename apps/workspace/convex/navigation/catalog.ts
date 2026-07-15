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
      node("crm", "crm.leads", "leads", "attention", "leads", { required: true }),
      node("crm", "crm.clients", "clients", "clients", "clients", { required: true }),
      node("crm", "crm.contacts", "contacts", "members", "contacts"),
      node("crm", "crm.companies", "companies", "organization", "companies"),
      node("crm", "crm.deals", "deals", "deals", "deals", { required: true }),
      node("crm", "crm.proposals", "proposals", "docs", "proposals"),
      node("crm", "crm.contracts", "contracts", "docs", "contracts"),
    ],
  },
  {
    id: "delivery", labelKey: "delivery", iconId: "delivery", routeId: "delivery", required: true, opensPanel: true, readResources: ["project"],
    nodes: [
      node("delivery", "delivery.overview", "deliveryOverview", "overview", "delivery", { required: true }),
      node("delivery", "delivery.engagements", "engagements", "projects", "delivery", { required: true }),
      node("delivery", "delivery.active", "activeDelivery", "attention", "delivery", { params: { status: "active" } }),
      node("delivery", "delivery.approvals", "clientApprovals", "inbox", "delivery", { params: { view: "approvals" } }),
      node("delivery", "delivery.change-orders", "changeOrders", "docs", "delivery", { params: { view: "change-orders" } }),
      node("delivery", "delivery.risks", "risksAndIssues", "attention", "delivery", { params: { view: "risks" } }),
    ],
  },
  {
    id: "resources", labelKey: "resources", iconId: "resources", routeId: "resources", required: true, opensPanel: true, readResources: ["team", "project"], accessMode: "any",
    nodes: [
      node("resources", "resources.overview", "resourceOverview", "overview", "resources", { required: true }),
      node("resources", "resources.people", "people", "members", "resources", { params: { view: "people" } }),
      node("resources", "resources.teams", "teams", "members", "resources", { params: { view: "teams" } }),
      node("resources", "resources.contractors", "contractors", "members", "resources", { params: { view: "contractors" } }),
      node("resources", "resources.skills", "skills", "tags", "resources", { params: { view: "skills" } }),
      node("resources", "resources.capacity", "capacity", "calendar", "resources", { params: { view: "capacity" } }),
      node("resources", "resources.allocations", "allocations", "projects", "resources", { params: { view: "allocations" } }),
      node("resources", "resources.workload", "workload", "tasks", "resources", { params: { view: "workload" } }),
      node("resources", "resources.availability", "availability", "calendar", "resources", { params: { view: "availability" } }),
      node("resources", "resources.leave", "leave", "calendar", "resources", { params: { view: "leave" } }),
      node("resources", "resources.hiring", "hiringDemand", "attention", "resources", { params: { view: "hiring" } }),
      node("resources", "resources.scenarios", "scenarios", "overview", "resources", { params: { view: "scenarios" } }),
      node("resources", "resources.rate-cards", "rateCards", "billing", "resources", { params: { view: "rate-cards" } }),
      node("resources", "resources.reports", "resourceReports", "reports", "resources", { params: { view: "reports" } }),
    ],
  },
  {
    id: "finance", labelKey: "finance", iconId: "finance", routeId: "finance", required: true, opensPanel: true, readResources: ["finance"],
    nodes: [
      node("finance", "finance.overview", "financeOverview", "overview", "finance", { required: true }),
      node("finance", "finance.project-budgets", "projectBudgets", "projects", "finance", { params: { view: "project-budgets" } }),
      node("finance", "finance.engagement-budgets", "engagementBudgets", "delivery", "finance", { params: { view: "engagement-budgets" } }),
      node("finance", "finance.estimates", "estimates", "docs", "finance", { params: { view: "estimates" } }),
      node("finance", "finance.rate-cards", "rateCards", "billing", "finance", { params: { view: "rate-cards" } }),
      node("finance", "finance.expenses", "expenses", "billing", "finance", { params: { view: "expenses" } }),
      node("finance", "finance.invoices", "invoices", "docs", "finance", { params: { view: "invoices" } }),
      node("finance", "finance.payments", "payments", "billing", "finance", { params: { view: "payments" } }),
      node("finance", "finance.retainers", "retainers", "billing", "finance", { params: { view: "retainers" } }),
      node("finance", "finance.receivable", "accountsReceivable", "attention", "finance", { params: { view: "receivable" } }),
      node("finance", "finance.payable", "accountsPayable", "attention", "finance", { params: { view: "payable" } }),
      node("finance", "finance.vendors", "vendors", "members", "finance", { params: { view: "vendors" } }),
      node("finance", "finance.banking", "banking", "billing", "finance", { params: { view: "banking" } }),
      node("finance", "finance.reconciliation", "reconciliation", "completed", "finance", { params: { view: "reconciliation" } }),
      node("finance", "finance.accounts", "chartOfAccounts", "tasks", "finance", { params: { view: "chart-of-accounts" } }),
      node("finance", "finance.journals", "journalEntries", "docs", "finance", { params: { view: "journal-entries" } }),
      node("finance", "finance.ledger", "generalLedger", "tasks", "finance", { params: { view: "ledger" } }),
      node("finance", "finance.tax", "tax", "billing", "finance", { params: { view: "tax" } }),
      node("finance", "finance.period-close", "periodClose", "calendar", "finance", { params: { view: "period-close" } }),
      node("finance", "finance.reports", "financialReports", "reports", "finance", { params: { view: "reports" } }),
    ],
  },
  {
    id: "reports", labelKey: "reports", iconId: "reports", routeId: "reports", required: true, opensPanel: true, readResources: ["report"],
    nodes: [
      node("reports", "reports.executive", "executive", "overview", "reports", { params: { view: "executive" }, required: true }),
      node("reports", "reports.sales", "sales", "deals", "reports", { params: { view: "sales" } }),
      node("reports", "reports.pipeline", "pipeline", "deals", "reports", { params: { view: "pipeline" } }),
      node("reports", "reports.delivery", "delivery", "delivery", "reports", { params: { view: "delivery" } }),
      node("reports", "reports.utilization", "resourceUtilization", "resources", "reports", { params: { view: "resource_utilization" } }),
      node("reports", "reports.capacity", "capacity", "calendar", "reports", { params: { view: "capacity" } }),
      node("reports", "reports.project-profitability", "projectProfitability", "finance", "reports", { params: { view: "project_profitability" } }),
      node("reports", "reports.client-profitability", "clientProfitability", "finance", "reports", { params: { view: "client_profitability" } }),
      node("reports", "reports.finance", "finance", "finance", "reports", { params: { view: "finance" } }),
      node("reports", "reports.tax", "tax", "billing", "reports", { params: { view: "tax" } }),
      node("reports", "reports.saved", "savedReports", "reports", "reports", { params: { view: "saved" } }),
      node("reports", "reports.scheduled", "scheduledReports", "calendar", "reports", { params: { view: "scheduled" } }),
      node("reports", "reports.builder", "reportBuilder", "automations", "reports", { params: { view: "builder" } }),
    ],
  },
  {
    id: "automations", labelKey: "automations", iconId: "automations", routeId: "automations", required: true, opensPanel: true, readResources: ["organization"],
    nodes: [
      node("automations", "automations.library", "automationLibrary", "automations", "automations", { params: { view: "library" }, required: true }),
      node("automations", "automations.workflows", "workflows", "automations", "automations", { params: { view: "workflows" }, required: true }),
      node("automations", "automations.active-runs", "activeRuns", "attention", "automations", { params: { view: "active-runs" } }),
      node("automations", "automations.approvals", "approvals", "inbox", "automations", { params: { view: "approvals" } }),
      node("automations", "automations.failures", "failures", "attention", "automations", { params: { view: "failures" } }),
      node("automations", "automations.history", "runHistory", "recent", "automations", { params: { view: "history" } }),
      node("automations", "automations.templates", "templates", "templates", "automations", { params: { view: "templates" } }),
      node("automations", "automations.webhooks", "webhooks", "integrations", "automations", { params: { view: "webhooks" } }),
      node("automations", "automations.connections", "connections", "integrations", "automations", { params: { view: "connections" } }),
      node("automations", "automations.usage", "usageAndLimits", "usage", "automations", { params: { view: "usage" } }),
    ],
  },
  {
    id: "ai", labelKey: "ai", iconId: "ai", routeId: "ai", required: true, opensPanel: true, readResources: ["organization"],
    nodes: [
      node("ai", "ai.new", "newConversation", "ai", "ai", { params: { mode: "new" }, required: true }),
      node("ai", "ai.conversations", "conversations", "ai", "ai", { required: true }),
      node("ai", "ai.agents", "agents", "members", "ai", { params: { mode: "agents" } }),
      node("ai", "ai.runs", "agentRuns", "recent", "ai", { params: { mode: "runs" } }),
      node("ai", "ai.approvals", "pendingApprovals", "inbox", "automations", { params: { view: "approvals" } }),
      node("ai", "ai.tools", "tools", "automations", "mcp"),
      node("ai", "ai.mcp", "mcpConnections", "mcp", "mcp"),
      node("ai", "ai.knowledge", "knowledgeSources", "docs", "docs", { params: { filter: "knowledge" } }),
      node("ai", "ai.usage", "usage", "usage", "usage"),
      node("ai", "ai.settings", "aiSettings", "admin", "integrations"),
    ],
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
