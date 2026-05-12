import { describe, expect, it } from "vitest";
import { demoConfig, requestedScopes } from "./config";
import { localDemoRegistration } from "./local-demo-registration";

describe("demo config", () => {
  it("requires a long session secret", () => {
    expect(() => demoConfig({
      ANAN_HUB_API_URL: "http://localhost:3000",
      ANAN_CLIENT_ID: "client",
      PARTNER_APP_URL: "http://localhost:3004",
      DEMO_ACCESS_TOKEN: "token",
      SESSION_SECRET: "short",
    })).toThrow("SESSION_SECRET must be at least 32 characters.");
  });

  it("documents the current local Partners registration", () => {
    expect(localDemoRegistration).toMatchObject({
      appName: "Anan OAuth Demo",
      publisherName: "ZA",
      partnerAppUrl: "http://localhost:3004",
      clientId: "partners_client_4p2f001r194s5z6e15473f582m331f4z4s0f",
      redirectUri: "http://localhost:3004/api/auth/anan/callback",
    });
    expect(requestedScopes).toEqual([
      "calendar:read",
      "client:create",
      "client:read",
      "client:update",
      "media:read",
      "organization:read",
      "project:read",
      "property:read",
      "task:read",
      "offline_access",
    ]);
  });
});
