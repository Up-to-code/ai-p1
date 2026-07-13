import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function exists(path: string) {
  return existsSync(resolve(root, path));
}

describe("architecture cleanup source guards", () => {
  it("keeps saved views on the canonical Convex module name", () => {
    expect(exists("convex/savedViews/read.ts")).toBe(true);
    expect(exists("convex/savedViews/write.ts")).toBe(true);
    expect(exists("convex/userTableViews/read.ts")).toBe(false);
    expect(read("src/domains/tasks/api/saved-views.ts")).toContain("api.savedViews");
    expect(read("src/domains/tasks/api/saved-views.ts")).not.toContain("api.userTableViews");
  });

  it("keeps route loading split into focused private modules", () => {
    const entry = read("src/components/loading/workspace-route-loading.tsx");
    expect(entry.split("\n").length).toBeLessThan(40);

    for (const module of [
      "app-route-loading",
      "auth-route-loading",
      "choose-organization-route-loading",
      "onboarding-route-loading",
      "session-check-loading",
    ]) {
      expect(exists(`src/components/loading/workspace-route-loading/${module}.tsx`)).toBe(true);
    }

    const sessionLoading = read(
      "src/components/loading/workspace-route-loading/session-check-loading.tsx",
    );
    expect(sessionLoading).toContain("PageLoading");
    expect(sessionLoading).not.toContain("WorkspaceShellSkeleton");
    expect(exists("src/components/loading/workspace-shell-skeleton.tsx")).toBe(false);
  });

  it("keeps metadata out of route-local SEO folders", () => {
    expect(exists("src/metadata/workspace.ts")).toBe(true);
    expect(exists("src/app/[locale]/seo/metadata.ts")).toBe(false);
    expect(read("src/app/layout.tsx")).toContain("@/metadata/workspace");
    expect(read("src/app/[locale]/layout.tsx")).toContain("@/metadata/workspace");
  });

  it("keeps sidebar inbox data, types, and filtering out of the composer", () => {
    const composer = read("src/components/layout/sidebar/components/sidebar-inbox-panel.tsx");
    expect(composer).toContain("filterChannelsByScope");
    expect(composer).toContain("groupInboxChannels");
    expect(composer).not.toContain("const orgFilterOptions");
    expect(composer).not.toContain("type OrgFilterType");
    expect(exists("src/components/layout/sidebar/components/sidebar-inbox-panel/data.ts")).toBe(true);
    expect(exists("src/components/layout/sidebar/components/sidebar-inbox-panel/types.ts")).toBe(true);
    expect(exists("src/components/layout/sidebar/components/sidebar-inbox-panel/channel-filter.ts")).toBe(true);
  });
});
