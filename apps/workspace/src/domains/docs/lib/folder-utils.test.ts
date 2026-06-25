import { describe, expect, it } from "vitest";
import { buildBreadcrumbPath, getSubfolders } from "./folder-utils";
import type { DocFolder } from "../docs.types";

const folders: DocFolder[] = [
  {
    id: "a",
    name: "A",
    parentId: "",
    projectId: "",
    organizationId: "org",
    createdByUserId: "user",
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: "b",
    name: "B",
    parentId: "a",
    projectId: "",
    organizationId: "org",
    createdByUserId: "user",
    createdAt: 0,
    updatedAt: 0,
  },
];

describe("folder utils", () => {
  it("builds breadcrumb path from leaf to root", () => {
    expect(buildBreadcrumbPath(folders, "b").map((f) => f.id)).toEqual(["a", "b"]);
  });

  it("lists subfolders for a parent", () => {
    expect(getSubfolders(folders, "a").map((f) => f.id)).toEqual(["b"]);
  });
});
