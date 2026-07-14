import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const source = readFileSync(resolve(__dirname, "sidebar-secondary-panel.tsx"), "utf8");

describe("secondary sidebar server-synced width", () => {
  it("clamps restored and resized widths", () => {
    expect(source).toContain("Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))");
    expect(source).toContain("const MIN_WIDTH = 188");
    expect(source).toContain("const DEFAULT_WIDTH = 248");
    expect(source).toContain("const MAX_WIDTH = 360");
  });

  it("reads and writes width through the authorized navigation overlay", () => {
    expect(source).toContain("secondaryPanelWidth");
    expect(source).toContain("setSecondaryPanelWidth");
    expect(source).not.toContain("useIndexedDbConfig");
  });

  it("keeps pointer movement local and persists the final clamped width", () => {
    expect(source).toContain("let latestWidth = width");
    expect(source).toContain("setDragWidth(latestWidth)");
    expect(source).toContain("void setSecondaryPanelWidth(latestWidth)");
    expect(source).toContain("setDragWidth(null)");
  });

  it("does not copy server width into effect-synchronized client state", () => {
    expect(source).not.toContain("useEffect");
    expect(source).toContain("dragWidth ?? secondaryPanelWidth");
  });
});
