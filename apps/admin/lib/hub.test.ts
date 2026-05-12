import { describe, expect, it } from "vitest";
import { hubAdminConfig } from "./hub";

describe("hubAdminConfig", () => {
  it("normalizes the hub base url and service token", () => {
    expect(hubAdminConfig({
      HUB_API_BASE_URL: "localhost:3000/",
      HUB_ADMIN_SERVICE_TOKEN: " secret ",
    })).toEqual({
      baseUrl: "https://localhost:3000",
      token: "secret",
    });
  });

  it("does not use the legacy platform token as an admin fallback", () => {
    expect(hubAdminConfig({
      HUB_API_BASE_URL: "http://localhost:3000",
      ANAN_PLATFORM_SERVICE_TOKEN: "platform-secret",
    }).token).toBe("");
  });
});
