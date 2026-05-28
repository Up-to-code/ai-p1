import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("workspace resource request seam", () => {
  it("keeps read-heavy screens on the shared resource request Module", () => {
    const activity = read("src/domains/activity/components/activity-screen.tsx");
    const dashboard = read("src/domains/dashboard/components/dashboard-screen.tsx");

    expect(activity).toContain("useWorkspaceIndexedResource");
    expect(activity).not.toContain("/read/activity/index");
    expect(dashboard).toContain("useWorkspaceResourceResult");
    expect(dashboard).not.toContain("/read/dashboard/index");
  });
});
