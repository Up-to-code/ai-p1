import { describe, expect, it } from "vitest";

import { resolveAuthTopology } from "./topology.js";

describe("auth topology", () => {
  it("derives every local endpoint from the workspace origin", () => {
    expect(resolveAuthTopology({ NODE_ENV: "development" })).toEqual({
      marketingOrigin: "http://localhost:3005",
      workspaceOrigin: "http://localhost:3000",
      authIssuer: "http://localhost:3000/api/auth",
      jwksUrl: "http://localhost:3000/api/auth/jwks",
      mcpResourceUrl: "http://localhost:3000/api/mcp",
      mcpProtectedResourceMetadataUrl: "http://localhost:3000/.well-known/oauth-protected-resource/api/mcp",
    });
  });

  it("prefers canonical URLs and normalizes trailing slashes", () => {
    const topology = resolveAuthTopology({
      NODE_ENV: "development",
      QENTRAH_MARKETING_URL: " https://marketing.example.test/ ",
      QENTRAH_WORKSPACE_URL: " https://workspace.example.test/ ",
      NEXT_PUBLIC_APP_URL: "https://ignored.example.test",
    });

    expect(topology.marketingOrigin).toBe("https://marketing.example.test");
    expect(topology.workspaceOrigin).toBe("https://workspace.example.test");
    expect(topology.mcpResourceUrl).toBe("https://workspace.example.test/api/mcp");
  });

  it("uses NEXT_PUBLIC_APP_URL as the workspace compatibility input", () => {
    expect(resolveAuthTopology({
      NODE_ENV: "development",
      NEXT_PUBLIC_APP_URL: "https://preview.example.test",
    }).workspaceOrigin).toBe("https://preview.example.test");
  });

  it("defaults to branded HTTPS origins in production", () => {
    const topology = resolveAuthTopology({ NODE_ENV: "production" });

    expect(topology.marketingOrigin).toBe("https://www.qentrah.com");
    expect(topology.workspaceOrigin).toBe("https://app.qentrah.com");
    expect(topology.authIssuer).toBe("https://app.qentrah.com/api/auth");
  });

  it.each([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://[::1]:3000",
  ])("rejects a production loopback workspace origin: %s", (workspaceUrl) => {
    expect(() => resolveAuthTopology({
      NODE_ENV: "production",
      QENTRAH_WORKSPACE_URL: workspaceUrl,
    })).toThrow(/production/u);
  });

  it.each([
    "ftp://app.example.test",
    "https://user:secret@app.example.test",
    "https://app.example.test/path",
    "https://app.example.test?token=secret",
  ])("rejects an invalid public workspace origin: %s", (workspaceUrl) => {
    expect(() => resolveAuthTopology({
      NODE_ENV: "development",
      QENTRAH_WORKSPACE_URL: workspaceUrl,
    })).toThrow();
  });
});
