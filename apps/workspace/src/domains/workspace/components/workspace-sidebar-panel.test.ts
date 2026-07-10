import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const panelSource = readFileSync(fileURLToPath(new URL("./workspace-sidebar-panel.tsx", import.meta.url)), "utf8");

describe("WorkspaceSidebarPanel navigation", () => {
  it("keeps only canonical links and no mock content or inert actions", () => {
    expect(panelSource).toContain('href: "/ws/inbox"');
    expect(panelSource).toContain('href: "/ws/channels"');
    expect(panelSource).toContain('href: "/ws/spaces"');
    expect(panelSource).toContain('href: "/tasks"');
    expect(panelSource).toContain('href: "/projects"');
    expect(panelSource).not.toMatch(/Ask, Build, Create|Add Channel|New message|New Space/);
    expect(panelSource).not.toMatch(/label: "(?:Space|General|List|fack|Welcome)"/);
    expect(panelSource).not.toContain("<button");
  });
});
