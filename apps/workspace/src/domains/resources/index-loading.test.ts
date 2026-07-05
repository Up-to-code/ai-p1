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
      "src/domains/assets/components/assets-screens.tsx",
      "src/domains/calendar/components/CalendarPageRedesigned.tsx",
      "src/domains/activity/components/activity-screen.tsx",
    ].map(readSource);

    for (const source of sources) {
      expect(source).toContain("HttpQueryState");
      expect(source).toContain('queryStatus === "error"');
    }
  });

  it("uses contextual skeleton variants instead of one generic page loader", () => {
    const expectations = [
      ["src/domains/projects/components/projects-screens.tsx", 'variant={view === "grid" ? "grid" : "table"}'],
      ["src/domains/assets/components/assets-screens.tsx", 'variant={view === "grid" ? "grid" : "table"}'],
      ["src/domains/clients/components/clients-screens.tsx", 'variant={view === "pipeline" ? "pipeline" : view === "calendar" ? "calendar" : "table"}'],
      ["src/domains/calendar/components/CalendarPageRedesigned.tsx", 'variant="calendar"'],
      ["src/domains/activity/components/activity-screen.tsx", 'variant="activity"'],
    ];

    for (const [path, expectedVariant] of expectations) {
      expect(readSource(path)).toContain(expectedVariant);
    }

    const sharedLoadingSource = readSource("src/components/shared/crud-ui.tsx");
    expect(sharedLoadingSource).toContain("function ResourceLoadingSkeleton");
    expect(sharedLoadingSource).not.toContain("Loader2");
    expect(sharedLoadingSource).not.toContain("animate-spin");
  });

  it("keeps root and app route loading empty so real page actions remain responsible for loading", () => {
    expect(readSource("src/app/[locale]/loading.tsx")).toContain("return null");
    expect(readSource("src/app/[locale]/(app)/loading.tsx")).toContain("return null");
  });
});
