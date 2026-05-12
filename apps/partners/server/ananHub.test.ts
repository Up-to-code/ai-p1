import { describe, expect, it } from "vitest";
import { ananHubConfig, normalizeHubScopes } from "./ananHub";

describe("Anan Hub registration config", () => {
  it("uses the explicit platform service token and normalizes URLs", () => {
    expect(ananHubConfig({
      ANAN_HUB_API_URL: "localhost:3000/",
      ANAN_PLATFORM_SERVICE_TOKEN: " platform-secret ",
      SITE_URL: "http://localhost:3002/",
    })).toEqual({
      baseUrl: "https://localhost:3000",
      serviceToken: "platform-secret",
      callbackBaseUrl: "http://localhost:3002",
    });
  });

  it("falls back to the legacy Hub token during migration", () => {
    expect(ananHubConfig({
      ANAN_HUB_API_URL: "http://localhost:3000",
      ANAN_HUB_SERVICE_TOKEN: "hub-secret",
    }).serviceToken).toBe("hub-secret");
  });

  it("maps legacy Partners scopes to Hub API scopes and drops auth-only scopes", () => {
    expect(normalizeHubScopes([
      "openid",
      "clients:read_own",
      "properties:read_own",
      "organization:read_own",
      "client:read",
      "offline_access",
    ])).toEqual(["client:read", "property:read", "organization:read"]);
  });
});
