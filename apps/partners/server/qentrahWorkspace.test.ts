import { describe, expect, it } from "vitest";
import { qentrahWorkspaceConfig, normalizeWorkspaceScopes } from "./qentrahWorkspace";

describe("Qentrah Workspace registration config", () => {
  it("uses the explicit platform service token and normalizes URLs", () => {
    expect(qentrahWorkspaceConfig({
      QENTRAH_WORKSPACE_API_URL: "localhost:3000/",
      QENTRAH_PLATFORM_SERVICE_TOKEN: " platform-secret ",
      SITE_URL: "http://localhost:3002/",
    })).toEqual({
      baseUrl: "https://localhost:3000",
      serviceToken: "platform-secret",
      callbackBaseUrl: "http://localhost:3002",
    });
  });

  it("uses the workspace service token when no platform token is configured", () => {
    expect(qentrahWorkspaceConfig({
      QENTRAH_WORKSPACE_API_URL: "http://localhost:3000",
      QENTRAH_WORKSPACE_SERVICE_TOKEN: "workspace-secret",
    }).serviceToken).toBe("workspace-secret");
  });

  it("prefers configured brand env names for workspace sync", () => {
    expect(qentrahWorkspaceConfig({
      QENTRAH_WORKSPACE_API_URL: "http://workspace.localhost:3000",
      QENTRAH_PLATFORM_SERVICE_TOKEN: "platform-secret",
    })).toMatchObject({
      baseUrl: "http://workspace.localhost:3000",
      serviceToken: "platform-secret",
    });
  });

  it("maps legacy Partners scopes to Workspace API scopes and drops auth-only scopes", () => {
    expect(normalizeWorkspaceScopes([
      "openid",
      "clients:read_own",
      "properties:read_own",
      "organization:read_own",
      "client:read",
      "offline_access",
    ])).toEqual(["client:read", "property:read", "organization:read"]);
  });
});
