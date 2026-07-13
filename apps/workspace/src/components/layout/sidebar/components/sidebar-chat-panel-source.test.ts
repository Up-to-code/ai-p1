import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  fileURLToPath(new URL("./sidebar-chat-panel.tsx", import.meta.url)),
  "utf8",
);

describe("AI sidebar panel presentation", () => {
  it("uses the canonical Qentrah AI logo in the empty state", () => {
    expect(source).toContain("workspaceAssets.ai.logo");
    expect(source).not.toContain("Sparkles");
  });

  it("shows the shared Workspace and AI mode switch", () => {
    expect(source).toContain("<SidebarPanelLayout");
    expect(source).not.toContain("showModeSwitch={false}");
  });
});
