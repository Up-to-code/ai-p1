import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  fileURLToPath(new URL("../qentrah-table.tsx", import.meta.url)),
  "utf8",
);

describe("QentrahTable column-state interface", () => {
  it("applies controlled order, widths, and visibility through the grid API", () => {
    expect(source).toContain("export interface QentrahTableColumnState");
    expect(source).toContain("apiRef.current.applyColumnState");
    expect(source).toContain("applyOrder: true");
  });

  it("publishes completed user changes without persistence ownership", () => {
    expect(source).toContain("onColumnStateChange");
    expect(source).toContain('event.finished && event.source !== "api"');
    expect(source).toContain('event.source !== "api"');
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("useQuery");
  });
});
