import { describe, expect, it } from "vitest";
import { resolveSubdomainPath } from "./lib/subdomain-routing";

describe("resolveSubdomainPath", () => {
  it("keeps named app-host routes canonical", () => {
    expect(resolveSubdomainPath("app", "en", "/ai")).toBeNull();
    expect(resolveSubdomainPath("app", "en", "/projects")).toBeNull();
    expect(resolveSubdomainPath("app", "ar", "/onboarding")).toBeNull();
  });

  it("uses the workspace dashboard for the app host root", () => {
    expect(resolveSubdomainPath("app", "en", "/")).toBe("/en/ws");
  });

  it("continues to scope dedicated subdomains", () => {
    expect(resolveSubdomainPath("ai", "en", "/")).toBe("/en/ai");
    expect(resolveSubdomainPath("ws", "en", "/inbox")).toBe("/en/ws/inbox");
    expect(resolveSubdomainPath("ws", "en", "/ws/inbox")).toBeNull();
  });
});
