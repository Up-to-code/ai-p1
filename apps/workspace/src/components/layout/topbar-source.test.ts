import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("workspace topbar source", () => {
  it("composes topbar from dedicated subcomponents", () => {
    const source = readSource("src/components/layout/topbar/topbar.tsx");

    expect(source).toContain("<TopbarEssential />");
    expect(source).toContain("<TopbarSearch />");
    expect(source).toContain("<TopbarActions />");
    expect(source).toContain("isRtlLocale(locale)");
  });

  it("keeps global search navigation aligned with Work OS routes", () => {
    const source = readSource("src/components/layout/workspace-global-search/config/search-navigation.config.ts");
    const expectedActions = [
      '{ id: "dashboard", label: labels.dashboard, href: "/dashboard", icon: Building2 }',
      '{ id: "clients", label: labels.clients, href: "/clients", icon: UserRound }',
      '{ id: "opportunities", label: labels.opportunities, href: "/opportunities", icon: KanbanSquare }',
      '{ id: "projects", label: labels.projects, href: "/projects", icon: BriefcaseBusiness }',
      '{ id: "tasks", label: labels.tasks, href: "/tasks", icon: ListTodo }',
      '{ id: "calendar", label: labels.calendar, href: "/calendar", icon: CalendarDays }',
      '{ id: "automations", label: labels.automations, href: "/automations", icon: Workflow }',
      '{ id: "team", label: labels.team, href: "/team", icon: UsersRound }',
      '{ id: "integrations", label: labels.integrations, href: "/web-apps", icon: Plug }',
      '{ id: "settings", label: labels.settings, href: "/settings/organization", icon: Settings }',
    ];

    for (const action of expectedActions) {
      expect(source).toContain(action);
    }

    expect(source).not.toContain('id: "usage"');
    expect(source).not.toContain('id: "activity"');
    expect(source).not.toContain('id: "assets"');
  });
});
