import { describe, expect, it } from "vitest";
import { demoConfig, requestedScopes } from "./config";
import { localDemoRegistration } from "./local-demo-registration";

describe("demo config", () => {
  it("requires a long session secret", () => {
    expect(() => demoConfig({
      QENTRAH_WORKSPACE_API_URL: "http://localhost:3000",
      QENTRAH_CLIENT_ID: "client",
      PARTNER_APP_URL: "http://localhost:3004",
      DEMO_ACCESS_TOKEN: "token",
      SESSION_SECRET: "short",
    })).toThrow("SESSION_SECRET must be at least 32 characters.");
  });

  it("reads configured brand env names", () => {
    const base = {
      QENTRAH_WORKSPACE_API_URL: "http://workspace.localhost:3000",
      QENTRAH_CLIENT_ID: "workspace-client",
      PARTNER_APP_URL: "http://localhost:3004",
      DEMO_ACCESS_TOKEN: "token",
      SESSION_SECRET: "12345678901234567890123456789012",
    };

    expect(demoConfig(base)).toMatchObject({
      workspaceBaseUrl: "http://workspace.localhost:3000",
      clientId: "workspace-client",
    });

    expect(demoConfig({
      ...base,
      QENTRAH_WORKSPACE_API_URL: "http://canonical.localhost:3000",
      QENTRAH_CLIENT_ID: "canonical-client",
    })).toMatchObject({
      workspaceBaseUrl: "http://canonical.localhost:3000",
      clientId: "canonical-client",
    });
  });

  it("documents the current local Partners registration", () => {
    expect(localDemoRegistration).toMatchObject({
      appName: "Qentrah Partner Key Demo",
      publisherName: "ZA",
      partnerAppUrl: "http://localhost:3004",
      clientId: "partners_client_MvdsQoheDgpiYjk5iA9tBGY-",
      redirectUri: "http://localhost:3004/api/auth/qentrah/callback",
    });
    expect(requestedScopes).toEqual([
      "calendar:read",
      "client:create",
      "client:delete",
      "client:read",
      "client:update",
      "media:read",
      "organization:read",
      "project:read",
      "asset:read",
      "task:read",
    ]);
  });
});
