import { describe, expect, it } from "vitest";
import { normalizeCurrentProjectId } from "./use-current-project-id";

describe("normalizeCurrentProjectId", () => {
  it.each([null, "", "   ", "undefined", "UNDEFINED", "null"])(
    "treats %j as no project context",
    (value) => {
      expect(normalizeCurrentProjectId(value)).toBeNull();
    },
  );

  it("returns a trimmed project id", () => {
    expect(normalizeCurrentProjectId("  project_123  ")).toBe("project_123");
  });
});
