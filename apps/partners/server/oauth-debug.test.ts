import { afterEach, describe, expect, it, vi } from "vitest";
import { isOAuthDebugEnabled, oauthDebug, safeOAuthDebugFields } from "./oauth-debug";

describe("partners OAuth debug logging", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("keeps debug logging opt-in and safe for review/runtime events", () => {
    expect(isOAuthDebugEnabled({ QENTRAH_OAUTH_DEBUG: "false" })).toBe(false);
    expect(safeOAuthDebugFields({
      appId: "partners_app_1",
      clientId: "partners_client_1",
      serviceToken: "workspace-secret",
    })).toEqual({
      appId: "partners_app_1",
      clientId: "partners_client_1",
      serviceToken: "[redacted]",
    });
  });

  it("emits structured Partners OAuth records when enabled", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.stubEnv("QENTRAH_OAUTH_DEBUG", "1");

    oauthDebug("partners.app.review.success", { appId: "partners_app_1", clientSecret: "secret" });

    expect(info).toHaveBeenCalledWith(
      "[qentrah:oauth:partners]",
      JSON.stringify({
        event: "partners.app.review.success",
        appId: "partners_app_1",
        clientSecret: "[redacted]",
      }),
    );
  });
});
