import { describe, expect, it } from "vitest";
import {
  availablePropertyClientCandidates,
  filterPropertyProjectOptions,
  matchesPropertySearch,
  propertyGalleryPreview,
  propertyLinkedClientIds,
  propertyMediaAssets,
  selectedPropertyClientName,
} from "./property-view-model";

describe("property view-model", () => {
  it("matches property index rows by searchable fields", () => {
    const unit = {
      title: "Skyline Residence A-12",
      project: "North Gate",
      city: "Riyadh",
      reference: "UNIT-12",
    };

    expect(matchesPropertySearch(unit, "")).toBe(true);
    expect(matchesPropertySearch(unit, "north")).toBe(true);
    expect(matchesPropertySearch(unit, "UNIT-12")).toBe(true);
    expect(matchesPropertySearch(unit, "jeddah")).toBe(false);
  });

  it("splits media assets into gallery and document surfaces", () => {
    const media = [
      { id: "image", kind: "image" },
      { id: "video", kind: "video" },
      { id: "document", kind: "document" },
      { id: "other", kind: "floorplan" },
    ];

    expect(propertyMediaAssets(media)).toEqual({
      galleryAssets: [
        { id: "image", kind: "image" },
        { id: "video", kind: "video" },
      ],
      documentAssets: [{ id: "document", kind: "document" }],
    });
  });

  it("returns visible gallery assets and hidden count", () => {
    const assets = ["a", "b", "c", "d", "e", "f"];

    expect(propertyGalleryPreview(assets)).toEqual({
      previewGallery: ["a", "b", "c", "d", "e"],
      hiddenGalleryCount: 1,
    });
    expect(propertyGalleryPreview(assets, 3)).toEqual({
      previewGallery: ["a", "b", "c"],
      hiddenGalleryCount: 3,
    });
  });

  it("filters linked clients out of candidate lists and resolves the selected name", () => {
    const links = [
      { link: { clientId: "client-1" } },
      { link: { clientId: 2 } },
    ];
    const clients = [
      { id: "client-1", name: "Already Linked" },
      { id: "2", name: "Numeric Linked" },
      { id: "client-3", name: "Available" },
    ];

    expect(propertyLinkedClientIds(links)).toEqual(new Set(["client-1", "2"]));
    expect(availablePropertyClientCandidates(clients, links)).toEqual([{ id: "client-3", name: "Available" }]);
    expect(selectedPropertyClientName(clients, "client-3")).toBe("Available");
    expect(selectedPropertyClientName(clients, "missing")).toBeUndefined();
  });

  it("filters project picker options by normalized project name", () => {
    const projects = [
      { id: "project-1", name: "North Gate" },
      { id: "project-2", name: "South Walk" },
    ];

    expect(filterPropertyProjectOptions(projects, "")).toBe(projects);
    expect(filterPropertyProjectOptions(projects, " north ")).toEqual([{ id: "project-1", name: "North Gate" }]);
  });
});
