import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const shellSource = readFileSync(
  fileURLToPath(new URL("./workspace-operating-surface.tsx", import.meta.url)),
  "utf8",
);
const indexSource = readFileSync(
  fileURLToPath(new URL("./workspace-index.tsx", import.meta.url)),
  "utf8",
);

describe("single-route Workspace shell", () => {
  it("keeps the index and content under the Workspace surface provider", () => {
    expect(shellSource).toContain("<WorkspaceSurfaceProvider");
    expect(shellSource).toContain("<WorkspaceIndex />");
    expect(shellSource).toContain("<WorkspaceContent />");
  });

  it("selects internal surfaces without route links", () => {
    expect(indexSource).toContain("selectSurface");
    expect(indexSource).not.toContain("router.push");
    expect(indexSource).not.toContain("<WorkspaceLink");
    expect(indexSource).not.toMatch(/Chat Activity|Drafts & Sent|Posts/);
  });
});
