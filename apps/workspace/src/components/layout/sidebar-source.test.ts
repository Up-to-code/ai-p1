import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("sidebar source", () => {
  it("keeps the implemented domain launcher canonical and ordered", () => {
    const source = readSource("convex/navigation/catalog.ts");
    const expectedItems = [
      'id: "home"',
      'id: "inbox"',
      'id: "spaces"',
      'id: "projects"',
      'id: "tasks"',
      'id: "docs"',
      'id: "calendar"',
      'id: "crm"',
      'id: "delivery"',
      'id: "resources"',
      'id: "finance"',
      'id: "reports"',
      'id: "automations"',
      'id: "ai"',
      'id: "admin"',
    ];

    let previousIndex = -1;
    for (const item of expectedItems) {
      const nextIndex = source.indexOf(item);
      expect(nextIndex, item).toBeGreaterThan(previousIndex);
      previousIndex = nextIndex;
    }
  });

  it("keeps domain launcher labels available in English and Arabic", () => {
    const enSidebar = JSON.parse(readSource("messages/en.json"))["Sidebar"];
    const arSidebar = JSON.parse(readSource("messages/ar.json"))["Sidebar"];

    for (const key of ["home", "inbox", "spaces", "projects", "tasks", "docs", "calendar", "crm", "delivery", "resources", "finance", "reports", "automations", "ai", "admin"]) {
      expect(enSidebar[key], `en:${key}`).toEqual(expect.any(String));
      expect(arSidebar[key], `ar:${key}`).toEqual(expect.any(String));
    }
  });
});
