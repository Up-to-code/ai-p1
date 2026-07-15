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
    expect(readApi).toContain("resolveChannelAccess");
    expect(readApi).toContain("filterReadable");
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
});
