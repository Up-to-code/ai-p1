import { describe, expect, it, vi } from "vitest";
import { clearMediaFolderAssignments, mediaAssetsInFolder } from "./resourcePolicy";

describe("media resource policy", () => {
  it("selects only media assets in a folder", () => {
    const media = [
      { _id: "asset_1", folderId: "folder_1" },
      { _id: "asset_2", folderId: "folder_2" },
      { _id: "asset_3" },
    ];

    const matches = mediaAssetsInFolder(media as never, "folder_1" as never) as Array<{ _id: string }>;
    expect(matches.map((asset) => asset._id)).toEqual(["asset_1"]);
  });

  it("clears folder assignment with one shared update timestamp", async () => {
    const patch = vi.fn();
    const ctx = { db: { patch } };
    const media = [
      { _id: "asset_1", folderId: "folder_1" },
      { _id: "asset_2", folderId: "folder_2" },
    ];

    await clearMediaFolderAssignments(ctx as never, media as never, "folder_1" as never, 123);

    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith("asset_1", { folderId: undefined, updatedAt: 123 });
  });
});
