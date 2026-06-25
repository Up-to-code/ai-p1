import { describe, expect, it } from "vitest";
import { Building2 } from "lucide-react";
import { buildGlobalSearchNavigationActions } from "../config/search-navigation.config";
import { matchesNavigationAction, normalizeSearchText, toProjectSearchResult } from "./search-utils";

describe("global search utils", () => {
  it("builds navigation actions from sidebar labels", () => {
    const actions = buildGlobalSearchNavigationActions({
      dashboard: "Dashboard",
      clients: "Clients",
      opportunities: "Opportunities",
      projects: "Projects",
      tasks: "Tasks",
      calendar: "Calendar",
      automations: "Automations",
      team: "Team",
      integrations: "Integrations",
      settings: "Settings",
    });

    expect(actions).toHaveLength(10);
    expect(actions[0]?.id).toBe("dashboard");
  });

  it("matches navigation actions by label", () => {
    const action = { id: "clients", label: "Clients", href: "/clients", icon: Building2 };
    expect(matchesNavigationAction(action, normalizeSearchText("client"))).toBe(true);
  });

  it("maps project records to search results", () => {
    expect(
      toProjectSearchResult({
        id: "proj_1",
        name: "Alpha",
        reference: "REF-1",
        status: "active",
      } as never),
    ).toMatchObject({
      id: "project:proj_1",
      title: "Alpha",
      href: "/projects/proj_1",
    });
  });
});
