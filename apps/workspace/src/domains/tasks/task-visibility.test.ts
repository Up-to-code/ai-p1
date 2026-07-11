import { describe, expect, it } from "vitest";
import { defaultTaskVisibility } from "./task-visibility";

describe("defaultTaskVisibility", () => {
  it("creates unscoped tasks as private", () => {
    expect(defaultTaskVisibility(undefined, "", "")).toBe("private");
  });

  it("creates scoped tasks as team-visible", () => {
    expect(defaultTaskVisibility(undefined, "project_1", "")).toBe("team");
    expect(defaultTaskVisibility(undefined, "", "space_1")).toBe("team");
  });

  it("preserves an explicitly selected visibility", () => {
    expect(defaultTaskVisibility("workspace", "", "")).toBe("workspace");
  });
});
