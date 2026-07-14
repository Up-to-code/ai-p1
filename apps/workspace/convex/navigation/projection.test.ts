import { describe, expect, it } from "vitest";
import { IMPLEMENTED_NAVIGATION_CATALOG } from "./catalog";
import { buildAuthorizedNavigationProjection } from "./projection";

describe("Authorized Navigation Projection", () => {
  it("omits unauthorized domains instead of exposing locked entries", () => {
    const result = buildAuthorizedNavigationProjection({
      organizationId: "org_1",
      allowedDomainIds: new Set(["home", "tasks"]),
      catalog: IMPLEMENTED_NAVIGATION_CATALOG,
    });
    expect(result.domains.map((domain) => domain.id)).toEqual(["home", "tasks"]);
  });

  it("merges personal order and aliases over Organization defaults", () => {
    const result = buildAuthorizedNavigationProjection({
      organizationId: "org_1",
      allowedDomainIds: new Set(["home", "tasks", "docs"]),
      catalog: IMPLEMENTED_NAVIGATION_CATALOG,
      organizationLayout: {
        domainOrder: ["docs", "tasks", "home"],
        aliases: { "domain:tasks": "Work" },
        version: 2,
      },
      userOverlay: {
        domainOrder: ["tasks"],
        aliases: { "domain:tasks": "My work" },
        railMode: "compact",
        secondaryPanelWidth: 312,
        version: 4,
      },
    });
    expect(result.domains.map((domain) => domain.id)).toEqual(["tasks", "docs", "home"]);
    expect(result.domains[0]?.labelOverride).toBe("My work");
    expect(result.railMode).toBe("compact");
    expect(result.layoutVersion).toBe(4);
    expect(result.secondaryPanelWidth).toBe(312);
  });

  it("appends newly introduced allowed domains in canonical order", () => {
    const result = buildAuthorizedNavigationProjection({
      organizationId: "org_1",
      allowedDomainIds: new Set(["home", "projects", "tasks"]),
      catalog: IMPLEMENTED_NAVIGATION_CATALOG,
      userOverlay: { domainOrder: ["tasks", "home"] },
    });
    expect(result.domains.map((domain) => domain.id)).toEqual(["tasks", "home", "projects"]);
  });

  it("keeps required nodes while applying optional visibility and aliases", () => {
    const result = buildAuthorizedNavigationProjection({
      organizationId: "org_1",
      allowedDomainIds: new Set(["tasks"]),
      catalog: IMPLEMENTED_NAVIGATION_CATALOG,
      organizationLayout: {
        hiddenOptionalNodeIds: ["tasks.mine", "tasks.all"],
        aliases: { "node:tasks.overdue": "Late work" },
      },
    });
    const nodes = result.domains[0]?.nodes ?? [];
    expect(nodes.some((node) => node.id === "tasks.all")).toBe(true);
    expect(nodes.some((node) => node.id === "tasks.mine")).toBe(false);
    expect(nodes.find((node) => node.id === "tasks.overdue")?.labelOverride).toBe("Late work");
  });
});
