import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

function read(path: string) {
  return readFileSync(resolve(srcRoot, path), "utf8");
}

describe("Dashboard authenticated shell auth readiness", () => {
  it("does not mount protected workspace reads while Convex auth is loading", () => {
    const shell = read("components/providers/dashboard-authenticated-shell.tsx");
    const projectWorkspace = read("domains/projects/api/project-workspace.ts");
    const sidebar = read("components/layout/sidebar/sidebar-rail-context.tsx");
    const projectPanel = read(
      "components/layout/sidebar/components/sidebar-domain-panels.tsx",
    );

    expect(shell).toContain('session.workspace.status === "convexAuthLoading"');
    expect(projectWorkspace).toContain(
      "organizationId && isAuthenticated ? { organizationId } : \"skip\"",
    );
    expect(sidebar).toContain(
      "organizationId && isAuthenticated ? { organizationId } : \"skip\"",
    );
    expect(projectPanel).toContain(
      "organizationId && isAuthenticated ? { organizationId } : \"skip\"",
    );
  });
});
