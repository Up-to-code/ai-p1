import { afterEach, describe, expect, it, vi } from "vitest";
import { authDebug, isAuthDebugEnabled, safeAuthDebugFields } from "./auth-debug";

describe("demo auth debug logging", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is opt-in and redacts auth secrets", () => {
    expect(isAuthDebugEnabled({ QENTRAH_AUTH_DEBUG: undefined })).toBe(false);
    expect(isAuthDebugEnabled({ QENTRAH_AUTH_DEBUG: "1" })).toBe(true);
    expect(isAuthDebugEnabled({ QENTRAH_OAUTH_DEBUG: "1" })).toBe(true);

    expect(safeAuthDebugFields({
      clientId: "partners_client_1",
      partnerKey: "secret-key",
      organizationId: "org_1",
    })).toEqual({
      clientId: "partners_client_1",
      partnerKey: "[redacted]",
      organizationId: "org_1",
    });
  });

  it("writes structured logs only when enabled", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    authDebug("demo.workos_partner_key.start", { clientId: "partners_client_1" });
    expect(info).not.toHaveBeenCalled();

    vi.stubEnv("QENTRAH_AUTH_DEBUG", "true");
    authDebug("demo.workos_partner_key.start", { clientId: "partners_client_1", clientSecret: "secret" });

    expect(info).toHaveBeenCalledWith(
      "[qentrah:auth:demo]",
      JSON.stringify({
        event: "demo.workos_partner_key.start",
        clientId: "partners_client_1",
        clientSecret: "[redacted]",
      }),
    );
  });
});
