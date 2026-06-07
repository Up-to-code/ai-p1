import { describe, expect, it } from "vitest";
import {
  availableAssetClientCandidates,
  filterAssetProjectOptions,
  matchesAssetSearch,
  assetGalleryPreview,
  assetLinkedClientIds,
  assetMediaAssets,
  selectedAssetClientName,
} from "./asset-view-model";

describe("asset view-model", () => {
  it("matches asset index rows by searchable fields", () => {
    const asset = {
      title: "Onboarding Brief A-12",
      project: "North Gate",
      city: "Remote",
      reference: "AST-12",
    };

    expect(matchesAssetSearch(asset, "")).toBe(true);
    expect(matchesAssetSearch(asset, "north")).toBe(true);
    expect(matchesAssetSearch(asset, "AST-12")).toBe(true);
    expect(matchesAssetSearch(asset, "south")).toBe(false);
  });

  it("splits media assets into gallery and document surfaces", () => {
    const media = [
      { id: "image", kind: "image" },
      { id: "video", kind: "video" },
      { id: "document", kind: "document" },
      { id: "other", kind: "floorplan" },
    ];

    expect(assetMediaAssets(media)).toEqual({
      galleryAssets: [
        { id: "image", kind: "image" },
        { id: "video", kind: "video" },
      ],
      documentAssets: [{ id: "document", kind: "document" }],
    });
  });

  it("returns visible gallery assets and hidden count", () => {
    const assets = ["a", "b", "c", "d", "e", "f"];

    expect(assetGalleryPreview(assets)).toEqual({
      previewGallery: ["a", "b", "c", "d", "e"],
      hiddenGalleryCount: 1,
    });
    expect(assetGalleryPreview(assets, 3)).toEqual({
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

    expect(assetLinkedClientIds(links)).toEqual(new Set(["client-1", "2"]));
    expect(availableAssetClientCandidates(clients, links)).toEqual([{ id: "client-3", name: "Available" }]);
    expect(selectedAssetClientName(clients, "client-3")).toBe("Available");
    expect(selectedAssetClientName(clients, "missing")).toBeUndefined();
  });

  it("filters project picker options by normalized project name", () => {
    const projects = [
      { id: "project-1", name: "North Gate" },
      { id: "project-2", name: "South Walk" },
    ];

    expect(filterAssetProjectOptions(projects, "")).toBe(projects);
    expect(filterAssetProjectOptions(projects, " north ")).toEqual([{ id: "project-1", name: "North Gate" }]);
  });
});
