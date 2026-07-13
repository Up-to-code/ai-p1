import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { workspaceAssets } from "./workspace-assets";

function assetPaths(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(assetPaths);
}

function publicFiles(directory: string, root = directory): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) return publicFiles(path, root);
    return [`/${path.slice(root.length + 1).replaceAll("\\", "/")}`];
  });
}

const publicRoot = resolve(process.cwd(), "public");
const manifestPaths = assetPaths(workspaceAssets).sort();

describe("Workspace public asset manifest", () => {
  it("contains unique paths that all exist", () => {
    expect(new Set(manifestPaths).size).toBe(manifestPaths.length);
    for (const path of manifestPaths) {
      expect(existsSync(resolve(publicRoot, path.slice(1))), path).toBe(true);
    }
  });

  it("accounts for every retained public file", () => {
    expect(publicFiles(publicRoot).sort()).toEqual(manifestPaths);
  });
});
