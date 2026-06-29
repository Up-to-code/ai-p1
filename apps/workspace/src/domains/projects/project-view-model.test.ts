import { describe, expect, it } from "vitest";
import {
  compactProjectDetailRows,
  matchesProjectSearch,
  projectDocumentAssets,
  projectDateDisplayLabel,
  projectFormDefaults,
  projectInventoryMetrics,
  projectLocationLabel,
  projectMovementWidth,
  projectWeekdayLabels,
  nextProjectCalendarMonth,
  toggleProjectAssetType,
} from "./lib/project-view-model";

describe("project view model", () => {
  it("selects document assets from project media", () => {
    expect(projectDocumentAssets([
      { id: "image_1", kind: "image" },
      { id: "doc_1", kind: "document" },
      { id: "video_1", kind: "video" },
    ])).toEqual([{ id: "doc_1", kind: "document" }]);
  });

  it("calculates inventory metrics from project assetCount", () => {
    expect(projectInventoryMetrics([
      { status: "available" },
      { status: "reserved" },
      { status: "sold" },
      { status: "pending" },
      { status: "AVAILABLE" },
    ], 10)).toEqual({
      plannedAssets: 10,
      liveAssetCount: 5,
      inventoryCoverage: 50,
      availableAssets: 2,
      reservedAssets: 1,
      soldAssets: 1,
      pendingAssets: 1,
    });
  });

  it("formats project sales movement widths with the existing minimum visible bar", () => {
    expect(projectMovementWidth(0, 0)).toBe("0%");
    expect(projectMovementWidth(1, 100)).toBe("8%");
    expect(projectMovementWidth(50, 100)).toBe("50%");
  });

  it("formats location and removes empty detail rows", () => {
    expect(projectLocationLabel({ reference: "PRJ-001" })).toBe("PRJ-001");
    expect(projectLocationLabel({})).toBe("");
    expect(compactProjectDetailRows([
      ["city", "Remote"],
      ["area", ""],
      ["plan", undefined],
    ])).toEqual([["city", "Remote"]]);
  });

  it("projects project date picker labels and month navigation", () => {
    expect(projectDateDisplayLabel(undefined, "Pick date")).toBe("Pick date");
    expect(projectDateDisplayLabel("2026-05-28", "Pick date")).toBe("May 28, 2026");
    expect(nextProjectCalendarMonth(new Date(2026, 4, 28), 1)).toEqual(new Date(2026, 5, 1));
    expect(projectWeekdayLabels().map((day) => day.label)).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("matches project search across public project fields", () => {
    const project = { name: "North Gate", reference: "PRJ-1" };

    expect(matchesProjectSearch(project, " north ")).toBe(true);
    expect(matchesProjectSearch(project, "prj")).toBe(true);
    expect(matchesProjectSearch(project, "south")).toBe(false);
  });

  it("projects stable form defaults from an existing project", () => {
    const defaults = projectFormDefaults({
      name: "North",
      status: "active",
      health: "onTrack",
      visibility: "public",
      description: "Desc",
    } as never);

    expect(defaults).toMatchObject({
      name: "North",
      status: "active",
      health: "onTrack",
      visibility: "public",
      description: "Desc",
    });
  });

  it("updates offering mix without mutating the current list", () => {
    const current = ["Office"];

    expect(toggleProjectAssetType([...current], "Retail")).toEqual(["Office", "Retail"]);
    expect(toggleProjectAssetType([...current], "Office")).toEqual([]);
    expect(current).toEqual(["Office"]);
  });
});
