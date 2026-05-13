import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseWorkspaceMode, workspaceModeHref } from "./store/dashboard.store";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("dashboard mode routing", () => {
  it("encodes normal and AI mode into dashboard URLs", () => {
    expect(parseWorkspaceMode(null)).toBe("ws");
    expect(parseWorkspaceMode("ws")).toBe("ws");
    expect(parseWorkspaceMode("ai")).toBe("ai");
    expect(parseWorkspaceMode("other")).toBe("ws");

    expect(workspaceModeHref("ws")).toBe("/dashboard?mode=ws");
    expect(workspaceModeHref("ai")).toBe("/dashboard?mode=ai");
    expect(workspaceModeHref("ai", "thread_123")).toBe("/dashboard?mode=ai&threadId=thread_123");
  });

  it("keeps the topbar, sidebar, and dashboard screen driven by the mode query", () => {
    const topbar = readSource("src/components/layout/topbar.tsx");
    const sidebar = readSource("src/components/layout/sidebar.tsx");
    const dashboard = readSource("src/domains/dashboard/components/dashboard-screen.tsx");
    const dashboardChat = readSource("src/components/dashboard/dashboard-chat.tsx");

    expect(topbar).toContain("lastAiThreadIdRef");
    expect(topbar).toContain('nextMode === "ai" ? lastAiThreadIdRef.current : undefined');
    expect(sidebar).toContain('workspaceModeHref("ws")');
    expect(sidebar).toContain('workspaceModeHref("ai", thread.id)');
    expect(dashboard).toContain('parseWorkspaceMode(searchParams.get("mode"))');
    expect(dashboardChat).toContain('params.set("mode", "ai")');
  });
});
