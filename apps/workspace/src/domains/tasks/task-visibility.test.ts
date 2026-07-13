import { describe, expect, it } from "vitest";
import { defaultTaskVisibility } from "./task-visibility";

describe("defaultTaskVisibility", () => {
  it("creates unscoped tasks as organization-visible", () => {
    expect(defaultTaskVisibility(undefined, "", "")).toBe("workspace");
  });

  it("creates scoped tasks as team-visible", () => {
    expect(defaultTaskVisibility(undefined, "project_1", "")).toBe("team");
    expect(defaultTaskVisibility(undefined, "", "space_1")).toBe("team");
  });

  it("preserves an explicitly selected visibility", () => {
    expect(defaultTaskVisibility("workspace", "", "")).toBe("workspace");
    expect(defaultTaskVisibility("private", "", "")).toBe("private");
  });

  it("normalizes a team Task without a team scope to organization visibility", () => {
    expect(defaultTaskVisibility("team", "", "")).toBe("workspace");
    expect(defaultTaskVisibility("team", "project_1", "")).toBe("team");
  });
});
