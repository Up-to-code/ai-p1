import { describe, expect, it } from "vitest";
import { IMPLEMENTED_NAVIGATION_CATALOG } from "./catalog";

const expectedDomains = ["home", "inbox", "spaces", "projects", "tasks", "docs", "calendar", "crm", "delivery", "resources", "finance", "reports", "automations", "ai", "admin"];
const requiredNodes: Record<string, string[]> = {
  home: ["home.overview", "home.my-work", "home.attention", "home.approvals", "home.deadlines", "home.recent", "home.favorites", "home.dashboards"],
  spaces: ["spaces.all", "spaces.mine", "spaces.favorites", "spaces.requests", "spaces.archived"],
  projects: ["projects.portfolio", "projects.all", "projects.mine", "projects.risk", "projects.recent", "projects.templates", "projects.archived"],
  reports: ["reports.executive", "reports.sales", "reports.pipeline", "reports.delivery", "reports.utilization", "reports.capacity", "reports.project-profitability", "reports.client-profitability", "reports.finance", "reports.tax", "reports.saved", "reports.scheduled", "reports.builder"],
  automations: ["automations.library", "automations.workflows", "automations.active-runs", "automations.approvals", "automations.failures", "automations.history", "automations.templates", "automations.webhooks", "automations.connections", "automations.usage"],
  ai: ["ai.new", "ai.conversations", "ai.agents", "ai.runs", "ai.approvals", "ai.tools", "ai.mcp", "ai.knowledge", "ai.usage", "ai.settings"],
  admin: ["admin.organization", "admin.members", "admin.teams-roles", "admin.spaces", "admin.permissions", "admin.workflows-statuses", "admin.custom-fields", "admin.templates", "admin.portal-branding", "admin.notifications", "admin.integrations", "admin.api-keys", "admin.mcp", "admin.billing", "admin.security", "admin.audit", "admin.import-export", "admin.searchPolicy", "admin.retention", "admin.features"],
};

describe("canonical agency navigation catalog", () => {
  it("keeps the locked domain order", () => expect(IMPLEMENTED_NAVIGATION_CATALOG.map((domain) => domain.id)).toEqual(expectedDomains));
  it("ships the required specific trees", () => {
    for (const [domainId, nodeIds] of Object.entries(requiredNodes)) expect(IMPLEMENTED_NAVIGATION_CATALOG.find((domain) => domain.id === domainId)?.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(nodeIds));
  });
  it("uses semantic route IDs instead of arbitrary URLs", () => {
    for (const domain of IMPLEMENTED_NAVIGATION_CATALOG) for (const node of domain.nodes) { expect(node.routeId).not.toContain("/"); expect(node.id.startsWith(`${domain.id}.`)).toBe(true); }
  });
});
