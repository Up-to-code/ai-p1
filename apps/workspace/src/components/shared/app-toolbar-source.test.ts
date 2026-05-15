import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("workspace toolbar filters", () => {
  it("renders filters through the custom dropdown instead of horizontal filter tabs", () => {
    const source = readSource("components/shared/app-layout-kit.tsx");

    expect(source).toContain("function AppFilterDropdown");
    expect(source).toContain('aria-haspopup="listbox"');
    expect(source).toContain('role="option"');
    expect(source).toContain("onFilterChange(filter.value)");
    expect(source).not.toContain("data-active={isActive}");
  });
});
