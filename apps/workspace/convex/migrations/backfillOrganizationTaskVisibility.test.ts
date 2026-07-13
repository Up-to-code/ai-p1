import { describe, expect, it } from "vitest";
import { legacyTaskVisibilityPatch } from "./backfillOrganizationTaskVisibility";

describe("legacy Task visibility migration", () => {
  const cutoff = 1_000;

  it("promotes only active private Tasks created by the former default", () => {
    expect(legacyTaskVisibilityPatch({
      visibility: "private",
      createdAt: cutoff,
      recordState: "active",
    }, cutoff)).toEqual({ visibility: "workspace" });

    expect(legacyTaskVisibilityPatch({
      visibility: "private",
      createdAt: cutoff + 1,
      recordState: "active",
    }, cutoff)).toBeNull();
    expect(legacyTaskVisibilityPatch({
      visibility: "workspace",
      createdAt: cutoff,
      recordState: "active",
    }, cutoff)).toBeNull();
    expect(legacyTaskVisibilityPatch({
      visibility: "private",
      createdAt: cutoff,
      recordState: "deleted",
    }, cutoff)).toBeNull();
  });
});
