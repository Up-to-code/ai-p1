import { describe, expect, it } from "vitest";
import { IMPLEMENTED_NAVIGATION_CATALOG } from "./catalog";

const expectedDomains = ["home", "inbox", "projects", "tasks", "docs", "calendar", "crm", "delivery", "resources", "finance", "reports", "automations", "admin"];
const requiredNodes: Record<string, string[]> = {
  home: ["home.overview", "home.my-work", "home.attention", "home.approvals", "home.deadlines", "home.recent", "home.favorites", "home.dashboards"],
  inbox: ["inbox.attention", "inbox.replies", "inbox.assigned-comments", "inbox.my-tasks", "inbox.channels"],
  projects: ["projects.portfolio", "projects.all", "projects.mine", "projects.risk", "projects.recent", "projects.templates", "projects.archived"],
  reports: ["reports.executive", "reports.sales", "reports.pipeline", "reports.delivery", "reports.utilization", "reports.capacity", "reports.project-profitability", "reports.client-profitability", "reports.finance", "reports.tax", "reports.saved", "reports.scheduled", "reports.builder"],
  automations: ["automations.coming-soon"],
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
  it("keeps Space contextual, AI secondary, and Automations truthful", () => {
    expect(IMPLEMENTED_NAVIGATION_CATALOG.some((domain) => domain.id === "spaces")).toBe(false);
    expect(IMPLEMENTED_NAVIGATION_CATALOG.some((domain) => domain.id === "ai")).toBe(false);
    expect(IMPLEMENTED_NAVIGATION_CATALOG.find((domain) => domain.id === "automations")?.nodes.map((node) => node.id)).toEqual(["automations.coming-soon"]);
  });
});
