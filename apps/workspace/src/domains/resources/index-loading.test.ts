import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("index HTTP loading states", () => {
  it("uses the shared HTTP query state for screens backed by HTTP workspace reads", () => {
    const sources = [
      "src/domains/clients/components/clients-screens.tsx",
      "src/domains/projects/components/projects-screens.tsx",
      "src/domains/properties/components/properties-screens.tsx",
      "src/domains/calendar/components/calendar-screen.tsx",
      "src/domains/activity/components/activity-screen.tsx",
      "src/domains/dashboard/components/dashboard-screen.tsx",
    ].map(readSource);

    for (const source of sources) {
      expect(source).toContain("HttpQueryState");
      expect(source).toContain('queryStatus === "error"');
    }
  });
});
