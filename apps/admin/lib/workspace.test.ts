import { describe, expect, it } from "vitest";
import { workspaceAdminConfig } from "./workspace";

describe("workspaceAdminConfig", () => {
  it("normalizes the workspace base url and service token", () => {
    expect(workspaceAdminConfig({
      WORKSPACE_API_BASE_URL: "localhost:3000/",
      WORKSPACE_ADMIN_SERVICE_TOKEN: " secret ",
    })).toEqual({
      baseUrl: "https://localhost:3000",
      token: "secret",
    });
  });

  it("does not use the legacy platform token as an admin fallback", () => {
    expect(workspaceAdminConfig({
      WORKSPACE_API_BASE_URL: "http://localhost:3000",
      ANAN_PLATFORM_SERVICE_TOKEN: "platform-secret",
    }).token).toBe("");
  });
});
