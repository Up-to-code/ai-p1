import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  isProductCapabilityEnabled,
  productCapabilities,
  productCapabilityFallback,
} from "./product-capabilities";

const workspaceRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(workspaceRoot, path), "utf8");
}

describe("product capabilities", () => {
  it("keeps destinations without production models disabled", () => {
    expect(productCapabilities).toEqual({
      deliveryEconomics: false,
      timeTracking: false,
      inboxPosts: false,
      inboxReplies: true,
      inboxActivity: false,
    });
    expect(isProductCapabilityEnabled("deliveryEconomics")).toBe(false);
    expect(productCapabilityFallback("deliveryEconomics")).toBe("/projects");
    expect(isProductCapabilityEnabled("timeTracking")).toBe(false);
    expect(productCapabilityFallback("timeTracking")).toBe("/tasks");
    expect(isProductCapabilityEnabled("inboxReplies")).toBe(true);
  });

  it("does not expose disabled products in enabled sidebar navigation", async () => {
    const { IMPLEMENTED_NAVIGATION_CATALOG } = await import("@convex/navigation/catalog");

    expect(IMPLEMENTED_NAVIGATION_CATALOG.some((item) => String(item.id) === "time-tracking")).toBe(false);
  });

  it("prevents disabled alias pages from rendering synthetic screens", () => {
    const routes = [
      ["time-tracking/page.tsx", "timeTracking", "TimeTrackingPageRedesigned"],
      ["inbox/posts/page.tsx", "inboxPosts", "InboxPostsScreen"],
      ["inbox/activity/page.tsx", "inboxActivity", "InboxActivityScreen"],
      ["organization/activity/page.tsx", "inboxActivity", "InboxActivityScreen"],
      ["ws/posts/page.tsx", "inboxPosts", "InboxPostsScreen"],
      ["ws/activity/page.tsx", "inboxActivity", "InboxActivityScreen"],
    ] as const;

    for (const [route, capability, screen] of routes) {
      const source = readSource(`src/app/[locale]/(app)/${route}`);
      expect(source).toContain(`isProductCapabilityEnabled("${capability}")`);
      expect(source).toContain("redirect(`/${locale}${productCapabilityFallback(");
      const redirectIndex = source.indexOf("redirect(`/${locale}${productCapabilityFallback(");
      const renderIndex = source.indexOf(`return <${screen}`);
      expect(renderIndex).toBeGreaterThanOrEqual(0);
      expect(redirectIndex).toBeLessThan(renderIndex);
    }
  });

  it("keeps project financial surfaces unavailable until delivery economics is enabled", () => {
    const detailLayout = readSource("src/domains/projects/components/detail/project-detail-layout.tsx");
    const projectDashboard = readSource("src/domains/projects/components/project-dashboard.tsx");
    const overviewDashboard = readSource("src/domains/projects/components/projects-overview-dashboard.tsx");
    const addProjectWidget = readSource("src/domains/projects/components/add-project-widget-modal.tsx");
    const addWidget = readSource("src/domains/projects/components/add-widget-modal.tsx");
    const budgetTab = readSource("src/domains/projects/components/detail/tabs/budget-tab.tsx");
    const budgetChart = readSource("src/domains/projects/components/widgets/budget-chart-widget.tsx");
    const budgetOverview = readSource("src/domains/projects/components/widgets/budget-overview-widget.tsx");
    const projectStats = readSource("src/domains/projects/components/widgets/project-stats-widget.tsx");
    const projectSidebar = readSource("src/domains/projects/components/project-overview-sidebar.tsx");

    expect(detailLayout).not.toContain('value: "budget"');
    expect(projectDashboard).not.toContain('type: "budget-chart"');
    expect(overviewDashboard).not.toContain('type: "budget"');
    expect(addProjectWidget).not.toContain('type: "budget"');
    expect(addWidget).not.toContain('{ type: "budget-chart"');
    for (const source of [budgetTab, budgetChart, budgetOverview]) {
      expect(source).toContain("Delivery economics is unavailable");
      expect(source).toContain("before enabling deliveryEconomics");
      expect(source).not.toContain('isProductCapabilityEnabled("deliveryEconomics")');
      expect(source).not.toContain("Spent");
      expect(source).not.toContain("Burn Rate");
    }
    expect(projectStats).toContain('label: "Planned budget"');
    expect(projectSidebar).toContain('label="Planned budget"');
    expect(projectStats).not.toContain('label: "Budget"');
    expect(projectSidebar).not.toContain('label="Budget"');
  });
});
