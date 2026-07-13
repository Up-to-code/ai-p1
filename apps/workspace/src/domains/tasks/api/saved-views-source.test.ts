import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("./saved-views.ts", import.meta.url)), "utf8");

describe("saved-view reactive adapter", () => {
  it("uses Convex subscriptions without a duplicate TanStack read cache", () => {
    expect(source).toContain('from "convex/react"');
    expect(source).not.toContain("@tanstack/react-query");
    expect(source).not.toContain("invalidateQueries");
  });
});
