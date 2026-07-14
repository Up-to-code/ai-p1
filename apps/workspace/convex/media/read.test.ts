import { describe, expect, it } from "vitest";
import { isPublicMediaAvailable } from "./read";

describe("public media security boundary", () => {
  it("serves only explicitly public media with a clean scan verdict", () => {
    expect(isPublicMediaAvailable({ shareVisibility: "public", malwareScanStatus: "clean" })).toBe(true);
    expect(isPublicMediaAvailable({ shareVisibility: "public", malwareScanStatus: "pending" })).toBe(false);
    expect(isPublicMediaAvailable({ shareVisibility: "public", malwareScanStatus: "infected" })).toBe(false);
    expect(isPublicMediaAvailable({ shareVisibility: "public" })).toBe(false);
    expect(isPublicMediaAvailable({ shareVisibility: "private", malwareScanStatus: "clean" })).toBe(false);
  });
});
