import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("workspace topbar source", () => {
  it("exposes create actions only for form-backed records", () => {
    const source = readSource("src/components/layout/topbar.tsx");

    expect(source).toContain('{ label: tWorkspace("createClient"), href: "/clients/create", icon: UserPlus }');
    expect(source).toContain('{ label: tWorkspace("createProject"), href: "/projects/create", icon: BriefcaseBusiness }');
    expect(source).toContain('{ label: tWorkspace("createAsset"), href: "/assets/create", icon: Package }');
    expect(source).not.toContain('href: "/tasks/create"');
    expect(source).not.toContain('href: "/opportunities/create"');
    expect(source).not.toContain('href: "/automations/create"');
  });

  it("keeps global search navigation aligned with Work OS routes", () => {
    const source = readSource("src/components/layout/workspace-global-search.tsx");
    const expectedActions = [
      '{ id: "dashboard", label: tSidebar("dashboard"), href: "/dashboard", icon: Building2 }',
      '{ id: "clients", label: tSidebar("clients"), href: "/clients", icon: UserRound }',
      '{ id: "opportunities", label: tSidebar("opportunities"), href: "/opportunities", icon: KanbanSquare }',
      '{ id: "projects", label: tSidebar("projects"), href: "/projects", icon: BriefcaseBusiness }',
      '{ id: "tasks", label: tSidebar("tasks"), href: "/tasks", icon: ListTodo }',
      '{ id: "calendar", label: tSidebar("calendar"), href: "/calendar", icon: CalendarDays }',
      '{ id: "assets", label: tSidebar("assets"), href: "/assets", icon: Package }',
      '{ id: "automations", label: tSidebar("automations"), href: "/automations", icon: Workflow }',
      '{ id: "team", label: tSidebar("team"), href: "/team", icon: UsersRound }',
      '{ id: "integrations", label: tSidebar("integrations"), href: "/web-apps", icon: Plug }',
      '{ id: "settings", label: tSidebar("settings"), href: "/settings/organization", icon: Settings }',
    ];

    for (const action of expectedActions) {
      expect(source).toContain(action);
    }

    expect(source).not.toContain('id: "usage"');
    expect(source).not.toContain('id: "activity"');
  });
});
