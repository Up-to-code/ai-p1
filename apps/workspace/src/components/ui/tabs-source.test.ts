import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "tabs.tsx"), "utf8");

describe("Tabs orientation styling", () => {
  it("uses Base UI's data-orientation contract for horizontal and vertical layouts", () => {
    expect(source).toContain("data-[orientation=horizontal]:flex-col");
    expect(source).toContain("group-data-[orientation=horizontal]/tabs");
    expect(source).toContain("group-data-[orientation=vertical]/tabs");
    expect(source).not.toContain("data-horizontal:");
    expect(source).not.toContain("group-data-horizontal/tabs");
    expect(source).not.toContain("group-data-vertical/tabs");
  });
});
