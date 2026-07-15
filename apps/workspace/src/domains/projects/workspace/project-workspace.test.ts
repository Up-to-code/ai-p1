import { describe, expect, it } from "vitest";
import {
  PROJECT_VIEW_TYPES,
  defaultProjectViewConfig,
  isProjectViewType,
  projectViewRoute,
} from "./project-workspace";

describe("Project Workspace route and saved-view codec", () => {
  it.each(PROJECT_VIEW_TYPES)("builds the canonical %s route", (viewType) => {
    expect(projectViewRoute(viewType)).toBe(`/projects/${viewType}`);
    expect(projectViewRoute(viewType, "saved-view-1")).toBe(
      `/projects/${viewType}/saved-view-1`,
    );
    expect(isProjectViewType(viewType)).toBe(true);
  });

  it("rejects unsupported project view types", () => {
    expect(isProjectViewType("form")).toBe(false);
    expect(isProjectViewType("whiteboard")).toBe(false);
    expect(isProjectViewType("map")).toBe(false);
  });

  it("uses truthful defaults for every supported view", () => {
    expect(defaultProjectViewConfig("table")).toMatchObject({
      sortBy: "updatedAt",
      sortDirection: "desc",
      columnOrder: ["name", "status", "health", "progress", "startDate", "endDate"],
      project: {
        visibleFields: ["name", "status", "health", "progress", "startDate", "endDate"],
      },
    });
    expect(defaultProjectViewConfig("list")).toMatchObject({ groupBy: "status" });
    expect(defaultProjectViewConfig("board")).toMatchObject({ groupBy: "status" });
    expect(defaultProjectViewConfig("calendar")).toMatchObject({
      project: { calendarScale: "week", calendarColorBy: "status", showUnscheduled: true },
    });
    expect(defaultProjectViewConfig("timeline")).toMatchObject({
      project: { timelineScale: "week", showUnscheduled: true },
    });
    expect(defaultProjectViewConfig("dashboard")).toMatchObject({
      project: { dashboardWidgets: [] },
    });
  });
});
