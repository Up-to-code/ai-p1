import { afterEach, describe, expect, it, vi } from "vitest";
import { isOAuthDebugEnabled, oauthDebug, safeOAuthDebugFields } from "./oauth-debug";

describe("demo OAuth debug logging", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is opt-in and redacts OAuth secrets", () => {
    expect(isOAuthDebugEnabled({ QENTRAH_OAUTH_DEBUG: undefined })).toBe(false);
    expect(isOAuthDebugEnabled({ QENTRAH_OAUTH_DEBUG: "1" })).toBe(true);

    expect(safeOAuthDebugFields({
      clientId: "partners_client_1",
      accessToken: "secret-token",
      codeVerifier: "verifier",
      organizationId: "org_1",
    })).toEqual({
      clientId: "partners_client_1",
      accessToken: "[redacted]",
      codeVerifier: "[redacted]",
      organizationId: "org_1",
    });
  });

  it("writes structured logs only when enabled", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    oauthDebug("demo.oauth.start", { clientId: "partners_client_1" });
    expect(info).not.toHaveBeenCalled();

    vi.stubEnv("QENTRAH_OAUTH_DEBUG", "true");
    oauthDebug("demo.oauth.start", { clientId: "partners_client_1", clientSecret: "secret" });

    expect(info).toHaveBeenCalledWith(
      "[qentrah:oauth:demo]",
      JSON.stringify({
        event: "demo.oauth.start",
        clientId: "partners_client_1",
        clientSecret: "[redacted]",
      }),
    );
  });
});
