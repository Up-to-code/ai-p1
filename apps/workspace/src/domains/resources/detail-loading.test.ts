import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("detail loading states", () => {
  it("uses the shared timed loading state for client, project, and property resource details", () => {
    const clients = readSource("src/domains/clients/components/clients-screens.tsx");
    const projects = readSource("src/domains/projects/components/projects-screens.tsx");
    const properties = readSource("src/domains/properties/components/properties-screens.tsx");

    for (const source of [clients, projects, properties]) {
      expect(source).toContain("workspaceStatus !== \"ready\"");
      expect(source).toContain("ProgressiveLoadingState");
      expect(source).toContain("debug={queryDebug}");
      expect(source).toContain('variant="detail"');
      expect(source).not.toContain('title="Loading client"');
      expect(source).not.toContain('title="Loading project"');
      expect(source).not.toContain('title="Loading unit"');
    }
  });
});
