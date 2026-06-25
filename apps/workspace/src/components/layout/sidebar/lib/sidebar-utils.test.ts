import { describe, expect, it } from "vitest";
import { isGeneratedOrganizationName, sidebarInitials } from "./sidebar-utils";

describe("sidebarInitials", () => {
  it("returns up to two initials", () => {
    expect(sidebarInitials("Ada Lovelace")).toBe("AL");
  });

  it("falls back when empty", () => {
    expect(sidebarInitials("   ")).toBe("AN");
  });
});

describe("isGeneratedOrganizationName", () => {
  it("detects generated slug-like names", () => {
    expect(isGeneratedOrganizationName("org_123456789012345678")).toBe(true);
  });

  it("accepts human-readable names", () => {
    expect(isGeneratedOrganizationName("Qentrah")).toBe(false);
  });
});
