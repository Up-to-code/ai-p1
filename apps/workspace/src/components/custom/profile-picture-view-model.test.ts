import { describe, expect, it } from "vitest";
import {
  CROP_OUTPUT_SIZE,
  PROFILE_PICTURE_ACCEPT,
  clamp,
  clampCropPosition,
  getCoverLayout,
} from "./profile-picture-view-model";

describe("profile picture view model", () => {
  it("keeps accepted avatar image types stable", () => {
    expect(PROFILE_PICTURE_ACCEPT).toBe("image/jpeg,image/png,image/webp");
    expect(CROP_OUTPUT_SIZE).toBe(512);
  });

  it("clamps scalar values", () => {
    expect(clamp(3, 0, 2)).toBe(2);
    expect(clamp(-1, 0, 2)).toBe(0);
    expect(clamp(1, 0, 2)).toBe(1);
  });

  it("builds cover layout for wide images", () => {
    expect(getCoverLayout({ width: 1024, height: 512 }, 1, { x: 0, y: 0 })).toEqual({
      scale: 1,
      renderedWidth: 1024,
      renderedHeight: 512,
      x: -256,
      y: 0,
    });
  });

  it("clamps crop panning inside the rendered image bounds", () => {
    const max = clampCropPosition({ width: 1024, height: 512 }, 1, { x: 999, y: 999 });
    const min = clampCropPosition({ width: 1024, height: 512 }, 1, { x: -999, y: -999 });

    expect(max.x).toBe(256);
    expect(max.y).toBeCloseTo(0);
    expect(min.x).toBe(-256);
    expect(min.y).toBeCloseTo(0);
  });
});
