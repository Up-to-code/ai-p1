import { describe, expect, it } from "vitest";
import {
  nextResourceMediaViewerIndex,
  resourceMediaAllowedKinds,
  resourceMediaAssets,
  resourceMediaPreviewWindow,
} from "./media-browser-view-model";

describe("media browser view-model", () => {
  it("selects allowed kinds for each browser mode", () => {
    expect(resourceMediaAllowedKinds("gallery")).toEqual(["image", "video"]);
    expect(resourceMediaAllowedKinds("documents")).toEqual(["document"]);
  });

  it("filters assets and sorts gallery covers first", () => {
    const media = [
      { id: "doc", kind: "document" as const },
      { id: "image", kind: "image" as const, isCover: false },
      { id: "cover", kind: "image" as const, isCover: true },
      { id: "video", kind: "video" as const },
    ];

    expect(resourceMediaAssets(media, ["image", "video"], "gallery").map((asset) => asset.id)).toEqual([
      "cover",
      "image",
      "video",
    ]);
    expect(resourceMediaAssets(media, ["document"], "documents").map((asset) => asset.id)).toEqual(["doc"]);
  });

  it("calculates preview windows and overflow counts", () => {
    const assets = ["a", "b", "c", "d", "e", "f"];

    expect(resourceMediaPreviewWindow(assets, "gallery")).toEqual({
      visibleAssets: ["a", "b", "c", "d", "e"],
      overflowCount: 1,
    });
    expect(resourceMediaPreviewWindow(assets, "documents")).toEqual({
      visibleAssets: assets,
      overflowCount: 0,
    });
    expect(resourceMediaPreviewWindow(assets, "documents", 2)).toEqual({
      visibleAssets: ["a", "b"],
      overflowCount: 4,
    });
  });

  it("moves the viewer index circularly", () => {
    expect(nextResourceMediaViewerIndex(null, 3, 1)).toBeNull();
    expect(nextResourceMediaViewerIndex(0, 0, 1)).toBe(0);
    expect(nextResourceMediaViewerIndex(0, 3, -1)).toBe(2);
    expect(nextResourceMediaViewerIndex(2, 3, 1)).toBe(0);
  });
});
