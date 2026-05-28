import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseWorkspaceMode, workspaceModeHref } from "./store/dashboard.store";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function readMessages(locale: "ar" | "en") {
  return JSON.parse(readFileSync(resolve(root, `messages/${locale}.json`), "utf8")) as {
    Sidebar: { dashboard: string };
    Workspace: { modeWs: string };
  };
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
    const conversationRuntime = readSource("src/domains/agents/conversation-runtime.ts");
    const markdown = readSource("src/components/ui/markdown.tsx");

    expect(topbar).toContain("activeAiThreadId");
    expect(topbar).toContain('nextMode === "ai" ? activeAiThreadId : undefined');
    expect(dashboardChat).toContain("setActiveAiThreadId(threadId)");
    expect(dashboardChat).toContain("...messages");
    expect(dashboardChat).toContain("visibleAgentConversationMessages");
    expect(conversationRuntime).toContain("durable.length < visibleTransientMessages.length");
    expect(conversationRuntime).toContain("function contentDirection");
    expect(conversationRuntime).toContain('return "rtl"');
    expect(conversationRuntime).toContain('return "ltr"');
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
    expect(sidebar).toContain("useAgentThreadsQuery(workspaceOrganizationId");
    expect(sidebar).toContain("enabled: Boolean(workspaceOrganizationId)");
    expect(dashboard).toContain('parseWorkspaceMode(searchParams.get("mode"))');
    expect(conversationRuntime).toContain('params.set("mode", "ai")');
  });

  it("keeps internal ws routing while avoiding visible WS labels", () => {
    const topbar = readSource("src/components/layout/topbar.tsx");
    const ar = readMessages("ar");
    const en = readMessages("en");

    expect(en.Sidebar.dashboard).toBe("Dashboard");
    expect(en.Workspace.modeWs).toBe("Dashboard");
    expect(ar.Sidebar.dashboard).toBe("لوحة التحكم");
    expect(ar.Workspace.modeWs).toBe("لوحة التحكم");
    expect(topbar).toContain('tWorkspace("modeWs")');
    expect(topbar).not.toContain('"Work"');
    expect(topbar).not.toContain('"العمل"');
  });
});
