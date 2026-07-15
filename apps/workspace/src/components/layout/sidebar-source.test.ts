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
      'id: "projects"',
      'id: "tasks"',
      'id: "docs"',
      'id: "calendar"',
      'id: "automations"',
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

    for (const key of ["home", "inbox", "projects", "tasks", "docs", "calendar", "crm", "delivery", "resources", "finance", "reports", "automations", "admin"]) {
      expect(enSidebar[key], `en:${key}`).toEqual(expect.any(String));
      expect(arSidebar[key], `ar:${key}`).toEqual(expect.any(String));
    }
  });

  it("keeps the primary rail permanently compact", () => {
    const source = readSource("src/components/layout/sidebar/components/sidebar-rail.tsx");
    expect(source).toContain('data-rail-mode="compact"');
    expect(source).toContain("w-12");
    expect(source).not.toContain("w-52");
    expect(source).not.toContain("setRailMode");
  });

  it("localizes every projected node label in English and Arabic", () => {
    const catalog = readSource("convex/navigation/catalog.ts");
    const labelKeys = [...catalog.matchAll(/node\([^,]+,[^,]+,\s*"([^"]+)"/g)]
      .map((match) => match[1]);
    const enNodes = JSON.parse(readSource("messages/en.json"))["Sidebar"]["nodes"];
    const arNodes = JSON.parse(readSource("messages/ar.json"))["Sidebar"]["nodes"];

    for (const key of new Set(labelKeys)) {
      expect(enNodes[key], `en:Sidebar.nodes.${key}`).toEqual(expect.any(String));
      expect(arNodes[key], `ar:Sidebar.nodes.${key}`).toEqual(expect.any(String));
    }
  });
});
