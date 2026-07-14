import { describe, expect, it } from "vitest";
import {
  buildSignInPath,
  classifyWorkspaceRoute,
  getSubdomainLabel,
  isLocalizedWorkspaceRoot,
  localizedEvePath,
  splitLocalizedPath,
} from "./workspace-route-policy";

describe("Workspace route policy", () => {
  it("classifies every route family at the proxy seam", () => {
    expect(classifyWorkspaceRoute("/api/auth/session")).toBe("bypass");
    expect(classifyWorkspaceRoute("/.well-known/oauth-authorization-server")).toBe("bypass");
    expect(classifyWorkspaceRoute("/en/sign-in")).toBe("public-auth");
    expect(classifyWorkspaceRoute("/ar/tasks/123")).toBe("protected");
    expect(classifyWorkspaceRoute("/en/billing")).toBe("protected");
    expect(classifyWorkspaceRoute("/ar/search")).toBe("protected");
    expect(classifyWorkspaceRoute("/en/mcp-docs")).toBe("localized-public");
    expect(classifyWorkspaceRoute("/en/eve/channel")).toBe("localized-eve");
  });

  it("normalizes locale-prefixed paths without losing nested segments", () => {
    expect(splitLocalizedPath("/ar/projects/p1/overview")).toEqual({
      locale: "ar",
      pathname: "/projects/p1/overview",
      hadLocale: true,
    });
    expect(splitLocalizedPath("/projects")).toEqual({
      locale: "en",
      pathname: "/projects",
      hadLocale: false,
    });
  });

  it("recognizes only locale-prefixed workspace roots", () => {
    expect(isLocalizedWorkspaceRoot("/en")).toBe(true);
    expect(isLocalizedWorkspaceRoot("/ar/")).toBe(true);
    expect(isLocalizedWorkspaceRoot("/")).toBe(false);
    expect(isLocalizedWorkspaceRoot("/en/ws")).toBe(false);
  });

  it("extracts dedicated subdomains and localized Eve targets", () => {
    expect(getSubdomainLabel("ws.localhost:3000")).toBe("ws");
    expect(getSubdomainLabel("app.qentrah.com")).toBe("app");
    expect(getSubdomainLabel("www.qentrah.com")).toBeNull();
    expect(localizedEvePath("/ar/_eve_internal/run")).toBe("/_eve_internal/run");
  });

  it("builds locale-safe sign-in redirects with the complete callback", () => {
    expect(buildSignInPath("/ar/tasks", "?space=s1")).toBe(
      "/ar/sign-in?callbackURL=%2Far%2Ftasks%3Fspace%3Ds1",
    );
  });
});
