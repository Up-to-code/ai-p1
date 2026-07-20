import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const panelSource = readFileSync(fileURLToPath(new URL("./workspace-sidebar-panel.tsx", import.meta.url)), "utf8");

describe("WorkspaceSidebarPanel navigation", () => {
  it("keeps the legacy panel as a projection adapter instead of duplicating the /ws index", () => {
    expect(panelSource).toContain("<SidebarProjectedDomainLinks");
    expect(panelSource).toContain('domainId="home"');
    expect(panelSource).not.toMatch(/Ask, Build, Create|Add Channel|New message|New Space/);
    expect(panelSource).not.toMatch(/label: "(?:Space|General|List|fack|Welcome)"/);
    expect(panelSource).not.toContain("<button");
  });
});
