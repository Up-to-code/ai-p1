import { describe, expect, it } from "vitest";
import {
  addProjectPriceRow,
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
  removeProjectPriceRow,
  toggleProjectAssetType,
  updateProjectPriceRow,
} from "./project-view-model";

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
    expect(projectLocationLabel({ city: "Remote", area: "Support" })).toBe("Remote · Support");
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
    const project = { name: "North Gate", reference: "PRJ-1", city: "Remote", developer: "Qentrah" };

    expect(matchesProjectSearch(project, " north ")).toBe(true);
    expect(matchesProjectSearch(project, "qent")).toBe(true);
    expect(matchesProjectSearch(project, "south")).toBe(false);
  });

  it("projects stable form defaults from an existing project", () => {
    const defaults = projectFormDefaults({
      name: "North",
      developer: "Qentrah",
      city: "Remote",
      area: "Support",
      type: "Unknown",
      assetTypes: ["Office", "Other"],
      status: "approved",
      visibility: "public",
      assetCount: 12,
      averagePrice: "",
      priceRange: "1M",
      projectPrices: [{ id: "price_1", label: "A", price: "1M" }],
      regaAuthorizationNo: "R",
      regaExpiresAt: "2026-01-01",
      planNumber: "P",
      plotNumber: "PL",
      postalIdentity: "PO",
      description: "Desc",
    } as never);

    expect(defaults).toMatchObject({
      name: "North",
      type: "Residential",
      assetTypes: ["Office"],
      assetCount: "12",
      averagePrice: "",
      projectPrices: [{ id: "price_1", label: "A", price: "1M" }],
    });
  });

  it("updates offering mix without mutating the current list", () => {
    const current = ["Office"] as const;

    expect(toggleProjectAssetType([...current], "Retail")).toEqual(["Office", "Retail"]);
    expect(toggleProjectAssetType([...current], "Office")).toEqual([]);
    expect(current).toEqual(["Office"]);
  });

  it("applies project price row commands", () => {
    const rows = [
      { id: "one", label: "One", price: "1M" },
      { id: "two", label: "Two", price: "2M" },
    ];

    expect(updateProjectPriceRow(rows, "two", "price", "2.5M")).toEqual([
      { id: "one", label: "One", price: "1M" },
      { id: "two", label: "Two", price: "2.5M" },
    ]);
    expect(addProjectPriceRow(rows, () => "three")).toEqual([
      ...rows,
      { id: "three", label: "", price: "" },
    ]);
    expect(removeProjectPriceRow(rows, "one", () => "fallback")).toEqual([
      { id: "two", label: "Two", price: "2M" },
    ]);
    expect(removeProjectPriceRow([{ id: "one", label: "", price: "" }], "one", () => "fallback")).toEqual([
      { id: "fallback", label: "", price: "" },
    ]);
  });
});
