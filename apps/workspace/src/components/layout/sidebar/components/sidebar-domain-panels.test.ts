import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(__dirname, "sidebar-domain-panels.tsx"), "utf8");

describe("domain-specific sidebar panels", () => {
  it("keeps Tasks navigation inside the Tasks domain and shows recent Tasks", () => {
    expect(source).toContain('<SidebarProjectedDomainLinks domainId="tasks" />');
    expect(source).toContain("useTasksQuery(organizationId)");
    expect(source).toContain('href={`/tasks/${task.id}`}');
    expect(source).toContain('t("recentlyEdited")');
  });

  it("keeps Docs navigation inside the Docs domain and shows recent Documents", () => {
    expect(source).toContain('<SidebarProjectedDomainLinks domainId="docs" />');
    expect(source).toContain('href={`/docs/${doc.id}`}');
    expect(source).toContain('t("recentlyEdited")');
  });

  it("does not own panels for non-project launcher domains", () => {
    for (const domain of ["Crm", "Delivery", "Resources", "Finance", "Reports"]) {
      expect(source).not.toContain(`Sidebar${domain}Panel`);
    }
  });
});
