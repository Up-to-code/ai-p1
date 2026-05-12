import { describe, expect, it } from "vitest";
import { dashboardNav } from "@/lib/navigation";

describe("dashboard navigation", () => {
  it("keeps global docs and create actions out of the sidebar", () => {
    const labels = dashboardNav.map((item) => item.label);

    expect(labels).toEqual(["Overview", "Apps", "Status", "Account"]);
    expect(labels).not.toContain("Documentation");
    expect(labels).not.toContain("Create App");
  });
});
