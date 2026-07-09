import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const source = readFileSync(resolve(__dirname, "sidebar-secondary-panel.tsx"), "utf8");

describe("secondary sidebar width persistence", () => {
  it("clamps restored and resized widths", () => {
    expect(source).toContain("Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))");
    expect(source).toContain("const MIN_WIDTH = 188");
    expect(source).toContain("const DEFAULT_WIDTH = 248");
    expect(source).toContain("const MAX_WIDTH = 360");
  });

  it("scopes the layout key to both organization and user", () => {
    expect(source).toContain('organization:${organizationId}:user:${userId}:${SIDEBAR_WIDTH_KEY}');
  });

  it("uses the latest pointer width and keeps persistence failures non-fatal", () => {
    expect(source).toContain("latestWidth.current");
    expect(source).toContain("setWidth(nextWidth)");
    expect(source).toContain("if (organizationId && userId)");
    expect(source).toContain("void persistWidth(latestWidth.current)");
    expect(source).toContain("onError: logStorageError");
  });

  it("resets the config hook before loading a changed scoped key", () => {
    const hookSource = readFileSync(
      resolve(__dirname, "../../../../domains/storage/use-indexeddb-config.ts"),
      "utf8",
    );
    expect(hookSource).toContain("setValueState(defaults);");
    expect(hookSource).toContain("[defaults, key, onError, store]");
  });
});
