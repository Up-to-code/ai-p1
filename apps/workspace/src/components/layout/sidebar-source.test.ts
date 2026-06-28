import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function sidebarMessages(source: string) {
  const start = source.indexOf('"Sidebar": {');
  const end = source.indexOf('"Topbar": {', start);
  return source.slice(start, end);
}

function countKey(source: string, key: string) {
  return Array.from(source.matchAll(new RegExp(`"${key}"\\s*:`, "g"))).length;
}

describe("sidebar source", () => {
  it("keeps the Work OS navigation route-complete and ordered", () => {
    const source = readSource("src/components/layout/sidebar/config/nav.config.ts");
    const expectedItems = [
      '{ name: "home", href: "/ws", icon: Home',
      '{ name: "inbox", href: "/inbox", icon: Inbox',
      '{ name: "ai", icon: Bot',
      '{ name: "spaces", icon: Layers',
      '{ name: "clients", href: "/clients", icon: UserRound',
      '{ name: "opportunities", href: "/opportunities", icon: KanbanSquare',
      '{ name: "deals", href: "/deals", icon: BadgeDollarSign',
      '{ name: "tasks", href: "/tasks", icon: ListTodo',
      '{ name: "calendar", href: "/calendar", icon: CalendarDays',
      '{ name: "docs", href: "/docs", icon: FileText',
      '{ name: "projects", href: "/spaces", icon: FolderGit2',
      '{ name: "automations", icon: Workflow',
      '{ name: "integrations", icon: Plug',
      '{ name: "organization", href: "/settings/organization", icon: Building2',
    ];

    let previousIndex = -1;
    for (const item of expectedItems) {
      const nextIndex = source.indexOf(item);
      expect(nextIndex, item).toBeGreaterThan(previousIndex);
      previousIndex = nextIndex;
    }

    expect(source).not.toContain('{ name: "usage"');
    expect(source).not.toContain('{ name: "activity"');
  });

  it("keeps sidebar message keys unique in English and Arabic", () => {
    const enSidebar = sidebarMessages(readSource("messages/en.json"));
    const arSidebar = sidebarMessages(readSource("messages/ar.json"));

    for (const key of ["dashboard", "clients", "opportunities", "deals", "projects", "tasks", "docs", "calendar", "automations", "integrations", "organization", "settings"]) {
      expect(countKey(enSidebar, key), `en:${key}`).toBe(1);
      expect(countKey(arSidebar, key), `ar:${key}`).toBe(1);
    }
  });
});
