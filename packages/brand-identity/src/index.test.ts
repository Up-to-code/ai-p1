import { describe, expect, it } from "vitest";

import {
  brandEnvName,
  brandIdentity,
  brandLabel,
  brandProductName,
  brandRoutePath,
  readBrandEnv,
} from "./index";

describe("@anan/brand-identity", () => {
  it("exposes localized brand and product names", () => {
    expect(brandLabel("en")).toBe("Qentrah");
    expect(brandLabel("ar")).toBe("قنطرة");
    expect(brandProductName("workspace", "en")).toBe("Qentrah Workspace");
    expect(brandProductName("workspace", "ar")).toBe("مساحة العمل قنطرة");
  });

  it("derives env names and route paths", () => {
    expect(brandEnvName("CLIENT_ID")).toBe("QENTRAH_CLIENT_ID");
    expect(brandRoutePath("oauthStart")).toBe("/api/auth/anan/start");
    expect(brandIdentity.colors.primary).toBe("#0b5cff");
  });

  it("reads canonical env values before legacy values", () => {
    expect(readBrandEnv("CLIENT_ID", { ANAN_CLIENT_ID: "legacy" })).toBe("legacy");
    expect(readBrandEnv("CLIENT_ID", { QENTRAH_CLIENT_ID: "canonical", ANAN_CLIENT_ID: "legacy" })).toBe("canonical");
    expect(readBrandEnv("CLIENT_ID", {}, "fallback")).toBe("fallback");
  });
});
