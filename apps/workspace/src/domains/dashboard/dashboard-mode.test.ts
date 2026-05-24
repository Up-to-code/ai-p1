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
    const markdown = readSource("src/components/ui/markdown.tsx");

    expect(topbar).toContain("activeAiThreadId");
    expect(topbar).toContain('nextMode === "ai" ? activeAiThreadId : undefined');
    expect(dashboardChat).toContain("setActiveAiThreadId(threadId)");
    expect(dashboardChat).toContain("...messages");
    expect(dashboardChat).toContain("durable.length < visibleTransientMessages.length");
    expect(dashboardChat).toContain("function contentDirection");
    expect(dashboardChat).toContain('return "rtl"');
    expect(dashboardChat).toContain('return "ltr"');
    expect(dashboardChat).toContain('dir={assistantDirection}');
    expect(dashboardChat).toContain('<Markdown dir={assistantDirection ?? "auto"}');
    expect(dashboardChat).toContain("[&_ul]:list-disc");
    expect(dashboardChat).toContain("[&_ol]:list-decimal");
    expect(markdown).toContain('<span\n          dir="auto"');
    expect(markdown).toContain("data-markdown-table-scroll");
    expect(markdown).toContain("overflow-x-auto");
    expect(markdown).toContain("w-max min-w-full max-w-none");
    expect(markdown).toContain('dir="auto"');
    expect(markdown).toContain("TableHeaderComponent");
    expect(markdown).toContain("TableCellComponent");
    expect(sidebar).toContain('workspaceModeHref("ws")');
    expect(sidebar).toContain('workspaceModeHref("ai", thread.id)');
    expect(dashboard).toContain('parseWorkspaceMode(searchParams.get("mode"))');
    expect(dashboardChat).toContain('params.set("mode", "ai")');
  });
});
