import { describe, expect, it } from "vitest";
import {
  clampLogoCrop,
  clampLogoCropPosition,
  organizationLogoCoverLayout,
  organizationLogoOutputSize,
} from "./organization-logo-view-model";
import { updateOrganizationProfileSchema } from "./validation/organization.schema";

describe("organization logo view model", () => {
  it("clamps scalar crop values", () => {
    expect(clampLogoCrop(-10, 0, 5)).toBe(0);
    expect(clampLogoCrop(7, 0, 5)).toBe(5);
    expect(clampLogoCrop(3, 0, 5)).toBe(3);
  });

  it("projects cover layout for the fixed logo output size", () => {
    expect(organizationLogoOutputSize).toBe(512);
    expect(organizationLogoCoverLayout({ width: 1024, height: 512 }, 1, { x: 0, y: 0 })).toEqual({
      scale: 1,
      renderedWidth: 1024,
      renderedHeight: 512,
      x: -256,
      y: 0,
    });
  });

  it("clamps crop position within rendered image bounds", () => {
    expect(clampLogoCropPosition({ width: 1024, height: 512 }, 1, { x: 500, y: 500 })).toEqual({
      x: 256,
      y: -0,
    });
    expect(clampLogoCropPosition({ width: 1024, height: 512 }, 1, { x: -500, y: -500 })).toEqual({
      x: -256,
      y: -0,
    });
  });

  it("allows saving an uploaded logo URL with organization profile data", () => {
    const parsed = updateOrganizationProfileSchema.safeParse({
      name: "Qentrah",
      legalName: "",
      type: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      logo: "https://cdn.example.com/org-logo.webp",
    });

    expect(parsed.success).toBe(true);
  });
});
