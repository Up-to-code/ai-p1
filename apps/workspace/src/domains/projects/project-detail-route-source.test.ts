import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = resolve(__dirname, "../..");

describe("Project detail route", () => {
  it("registers the canonical project identity route owned by ProjectDetailLayout", () => {
    const pagePath = resolve(
      workspaceRoot,
      "app/[locale]/(app)/projects/[projectId]/page.tsx",
    );
    const layoutPath = resolve(
      workspaceRoot,
      "app/[locale]/(app)/projects/[projectId]/layout.tsx",
    );
    const editPagePath = resolve(
      workspaceRoot,
      "app/[locale]/(app)/projects/[projectId]/edit/page.tsx",
    );

    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(editPagePath)).toBe(true);
    expect(readFileSync(pagePath, "utf8")).toContain("ProjectDetailPage");
    expect(readFileSync(editPagePath, "utf8")).toContain("ProjectEditPage");
    expect(readFileSync(layoutPath, "utf8")).toContain("ProjectDetailLayout");
  });

  it("uses the canonical Project identity route instead of the removed overview leaf", () => {
    const files = [
      "app/[locale]/(app)/projects/[projectId]/layout.tsx",
      "domains/projects/components/create-project-form.tsx",
      "domains/projects/components/edit-project-form.tsx",
    ];

    for (const file of files) {
      expect(readFileSync(resolve(workspaceRoot, file), "utf8")).not.toContain(
        "/overview`",
      );
    }
  });
});
