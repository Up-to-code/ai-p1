import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Project Workspace architecture guards", () => {
  it("keeps the surface projection server-authorized and access-filtered", () => {
    const readApi = read("convex/projectWorkspace/read.ts");

    expect(readApi).toContain("assertOrganizationPermission");
    expect(readApi).toContain("assertCanReadSavedViewScope");
    expect(readApi).toContain("resolveSavedViewGrantAccess");
    expect(readApi).toContain("resolveSpaceAccess");
    expect(readApi).toContain("resolveProjectAccess");
    expect(readApi).toContain("resolveDocumentAccess");
    expect(readApi).toContain("filterReadable");
  });

  it("keeps the Projects sidebar scoped to project-management records", () => {
    const readApi = read("convex/projectWorkspace/read.ts");
    const treeRenderer = read("src/components/shared/project-management-tree/project-management-tree.tsx");

    expect(readApi).not.toContain('ctx.db.query("channels")');
    expect(readApi).not.toContain("resolveChannelAccess");
    expect(treeRenderer).not.toContain('label="Channels"');
    expect(treeRenderer).not.toContain('label="Direct messages"');
    expect(treeRenderer).not.toContain('label="New message"');
  });

  it("keeps tab lifecycle invariants in one transactional command module", () => {
    const writeApi = read("convex/projectWorkspace/write.ts");

    for (const command of [
      "ensureProjectWorkspaceDefaults",
      "createAndAttachView",
      "renameViewTab",
      "reorderViewTabs",
      "duplicateViewTab",
      "detachViewTab",
      "updateViewConfig",
    ]) {
      expect(writeApi).toContain(`export const ${command} = mutation`);
    }
    expect(writeApi).toContain("At least one visible Project view must remain attached.");
  });

  it("owns cross-domain Saved View hooks outside Tasks", () => {
    const sharedViews = read("src/domains/views/api/saved-views.ts");
    const taskAdapter = read("src/domains/tasks/api/saved-views.ts");

    expect(sharedViews).toContain("export function useSavedViews");
    expect(taskAdapter).toContain('export * from "@/domains/views"');
    expect(taskAdapter).not.toContain("useQuery(");
  });

  it("renders the All Projects table from truthful project data and persisted view configuration", () => {
    const tableView = read("src/domains/projects/components/views/project-table-view.tsx");
    const collectionView = read("src/domains/projects/hooks/use-project-collection-view.ts");

    expect(tableView).toContain("listOrganizationMembers");
    expect(tableView).toContain("useUpdateProjectViewConfig");
    expect(tableView).toContain("StatusPill");
    expect(tableView).toContain("columnVisibility");
    expect(tableView).not.toContain("String(value)");
    expect(collectionView).toContain('params.get("sort")');
    expect(collectionView).toContain('params.get("direction")');
  });
});
