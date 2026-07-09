import { describe, expect, it } from "vitest";
import { mergeDashboardPatches } from "./use-dashboard-persistence";

describe("useDashboardPersistence patch contract", () => {
  it("keeps only local pending fields and does not construct a server snapshot", () => {
    expect(
      mergeDashboardPatches(
        { widgetConfig: '["tasks"]' },
        { layout: '[{"x": 1}]' },
      ),
    ).toEqual({
      widgetConfig: '["tasks"]',
      layout: '[{"x": 1}]',
    });
  });

  it("uses the latest local value for a pending field", () => {
    expect(
      mergeDashboardPatches(
        { notes: "First draft", layout: "[]" },
        { notes: "Final draft" },
      ),
    ).toEqual({ notes: "Final draft", layout: "[]" });
  });
});
