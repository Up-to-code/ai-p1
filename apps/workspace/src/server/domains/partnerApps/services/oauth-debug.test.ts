import { afterEach, describe, expect, it, vi } from "vitest";
import { isOAuthDebugEnabled, oauthDebug, safeOAuthDebugFields } from "./oauth-debug";

describe("workspace OAuth debug logging", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is opt-in and redacts token-bearing fields", () => {
    expect(isOAuthDebugEnabled({ QENTRAH_OAUTH_DEBUG: "yes" })).toBe(true);
    expect(safeOAuthDebugFields({
      partnersClientId: "partners_client_1",
      authorization: "Bearer token",
      state: "state",
      scopeCount: 2,
    })).toEqual({
      partnersClientId: "partners_client_1",
      authorization: "[redacted]",
      state: "[redacted]",
      scopeCount: 2,
    });
  });

  it("emits structured workspace OAuth records when enabled", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.stubEnv("QENTRAH_OAUTH_DEBUG", "1");

    oauthDebug("workspace.oauth.token.response", { clientId: "partners_client_1", code: "secret" });

    expect(info).toHaveBeenCalledWith(
      "[qentrah:oauth:workspace]",
      JSON.stringify({
        event: "workspace.oauth.token.response",
        clientId: "partners_client_1",
        code: "[redacted]",
      }),
    );
  });
});
