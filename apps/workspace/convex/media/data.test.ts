import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { orderedResourceMedia, orderedResourceMediaFolders, selectCoverUrl } from "./data";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("media data Module", () => {
  it("keeps resource media and folder reads bounded", () => {
    const source = read("convex/media/data.ts");

    expect(source).toContain("const MAX_RESOURCE_MEDIA = 100");
    expect(source).toContain("const MAX_RESOURCE_FOLDERS = 100");
    expect(source).toContain(".take(MAX_RESOURCE_MEDIA)");
    expect(source).toContain(".take(MAX_RESOURCE_FOLDERS)");
    expect(source).not.toContain(".collect(");
  });

  it("orders media and folders through one data Module surface", () => {
    expect(orderedResourceMedia([
      { id: "second", sortOrder: 2, createdAt: 1 },
      { id: "first-newer", sortOrder: 1, createdAt: 2 },
      { id: "first-older", sortOrder: 1, createdAt: 1 },
    ])).toEqual([
      { id: "first-older", sortOrder: 1, createdAt: 1 },
      { id: "first-newer", sortOrder: 1, createdAt: 2 },
      { id: "second", sortOrder: 2, createdAt: 1 },
    ]);

    expect(orderedResourceMediaFolders([
      { id: "b", name: "Zed", createdAt: 1 },
      { id: "a2", name: "Alpha", createdAt: 2 },
      { id: "a1", name: "Alpha", createdAt: 1 },
    ])).toEqual([
      { id: "a1", name: "Alpha", createdAt: 1 },
      { id: "a2", name: "Alpha", createdAt: 2 },
      { id: "b", name: "Zed", createdAt: 1 },
    ]);
  });

  it("selects the explicit image cover before ordered image fallbacks", () => {
    expect(selectCoverUrl([
      { kind: "video", url: "video", isCover: true, sortOrder: 0, createdAt: 0 },
      { kind: "image", url: "fallback", isCover: false, sortOrder: 0, createdAt: 1 },
      { kind: "image", url: "cover", isCover: true, sortOrder: 10, createdAt: 10 },
    ] as never)).toBe("cover");
  });
});
