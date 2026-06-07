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
    const source = readSource("src/components/layout/sidebar.tsx");
    const expectedItems = [
      '{ name: "dashboard", href: "/dashboard", icon: LayoutDashboard }',
      '{ name: "clients", href: "/clients", icon: UserRound }',
      '{ name: "opportunities", href: "/opportunities", icon: KanbanSquare }',
      '{ name: "projects", href: "/projects", icon: BriefcaseBusiness }',
      '{ name: "tasks", href: "/tasks", icon: ListTodo }',
      '{ name: "calendar", href: "/calendar", icon: CalendarDays }',
      '{ name: "assets", href: "/assets", icon: Package }',
      '{ name: "automations", href: "/automations", icon: Workflow }',
      '{ name: "team", href: "/team", icon: UsersRound }',
      '{ name: "integrations", href: "/web-apps", icon: Plug }',
      '{ name: "settings", href: "/settings/organization", icon: Settings }',
    ];

    let previousIndex = -1;
    for (const item of expectedItems) {
      const nextIndex = source.indexOf(item);
      expect(nextIndex, item).toBeGreaterThan(previousIndex);
      previousIndex = nextIndex;
    }

    expect(source).not.toContain('disabled: true, badge: "comingSoon"');
    expect(source).not.toContain('{ name: "usage"');
    expect(source).not.toContain('{ name: "activity"');
  });

  it("keeps sidebar message keys unique in English and Arabic", () => {
    const enSidebar = sidebarMessages(readSource("messages/en.json"));
    const arSidebar = sidebarMessages(readSource("messages/ar.json"));

    for (const key of ["dashboard", "clients", "opportunities", "projects", "tasks", "calendar", "assets", "automations", "team", "integrations", "settings"]) {
      expect(countKey(enSidebar, key), `en:${key}`).toBe(1);
      expect(countKey(arSidebar, key), `ar:${key}`).toBe(1);
    }
  });
});
