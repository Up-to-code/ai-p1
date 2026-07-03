import { describe, expect, it } from "vitest";

import {
  brandEnvName,
  brandIdentity,
  brandLabel,
  brandProductName,
  brandRoutePath,
  readBrandEnv,
} from "./index";

describe("@qentrah/brand-identity", () => {
  it("exposes localized brand and product names", () => {
    expect(brandLabel("en")).toBe("Qentrah");
    expect(brandLabel("ar")).toBe("كانترا");
    expect(brandProductName("workspace", "en")).toBe("Qentrah Workspace");
    expect(brandProductName("workspace", "ar")).toBe("مساحة العمل كانترا");
  });

  it("derives env names and route paths", () => {
    expect(brandEnvName("CLIENT_ID")).toBe("QENTRAH_CLIENT_ID");
    expect(brandRoutePath("oauthStart")).toBe("/api/auth/qentrah/start");
    expect(brandIdentity.colors.primary).toBe("#111111");
    expect(brandIdentity.domains.root).toBe("www.qentrah.com");
    expect(brandIdentity.domains.workspace).toBe("app.qentrah.com");
    expect(brandIdentity.domains.partners).toBe("partners.qentrah.com");
  });

  it("reads canonical env values", () => {
    expect(readBrandEnv("CLIENT_ID", { QENTRAH_CLIENT_ID: "canonical" })).toBe("canonical");
    expect(readBrandEnv("CLIENT_ID", {}, "fallback")).toBe("fallback");
  });
});
