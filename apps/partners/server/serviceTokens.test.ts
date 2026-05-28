import { describe, expect, it } from "vitest";
import { PartnerSyncError } from "@qentrah/partner-workspace-sync";
import {
  assertPartnersAdminServiceToken,
  assertPlatformServiceToken,
  partnersAdminServiceTokenFromEnv,
  platformServiceTokenFromEnv,
} from "./serviceTokens";

function headers(input: Record<string, string>) {
  return new Headers(input);
}

describe("Partners service-token gates", () => {
  it("reads the dedicated admin token only for Admin Review routes", () => {
    expect(partnersAdminServiceTokenFromEnv({
      PARTNERS_ADMIN_SERVICE_TOKEN: " admin-secret ",
      QENTRAH_PLATFORM_SERVICE_TOKEN: "platform-secret",
    })).toBe("admin-secret");
  });

  it("accepts admin bearer and legacy admin-token headers", () => {
    const env = { PARTNERS_ADMIN_SERVICE_TOKEN: "admin-secret" };

    expect(() => assertPartnersAdminServiceToken(headers({
      authorization: "Bearer admin-secret",
    }), env)).not.toThrow();
    expect(() => assertPartnersAdminServiceToken(headers({
      "x-qentrah-admin-token": "admin-secret",
    }), env)).not.toThrow();
  });

  it("rejects missing or mismatched admin tokens", () => {
    expect(() => assertPartnersAdminServiceToken(headers({}), {
      PARTNERS_ADMIN_SERVICE_TOKEN: "admin-secret",
    })).toThrow("Invalid Partners admin service token.");
    expect(() => assertPartnersAdminServiceToken(headers({
      authorization: "Bearer wrong",
    }), {
      PARTNERS_ADMIN_SERVICE_TOKEN: "admin-secret",
    })).toThrow("Invalid Partners admin service token.");
  });

  it("reads platform token env names in compatibility order", () => {
    expect(platformServiceTokenFromEnv({
      PARTNERS_PLATFORM_SERVICE_TOKEN: " partners-platform ",
      QENTRAH_PLATFORM_SERVICE_TOKEN: "qentrah-platform",
      WORKSPACE_SERVICE_TOKEN: "workspace",
    })).toBe("partners-platform");
    expect(platformServiceTokenFromEnv({
      QENTRAH_PLATFORM_SERVICE_TOKEN: " qentrah-platform ",
      WORKSPACE_SERVICE_TOKEN: "workspace",
    })).toBe("qentrah-platform");
    expect(platformServiceTokenFromEnv({
      WORKSPACE_SERVICE_TOKEN: " workspace ",
    })).toBe("workspace");
  });

  it("accepts platform bearer and legacy platform-token headers", () => {
    const env = { PARTNERS_PLATFORM_SERVICE_TOKEN: "platform-secret" };

    expect(() => assertPlatformServiceToken(headers({
      authorization: "Bearer platform-secret",
    }), env)).not.toThrow();
    expect(() => assertPlatformServiceToken(headers({
      "x-qentrah-platform-token": "platform-secret",
    }), env)).not.toThrow();
  });

  it("uses PartnerSyncError for platform-token failures", () => {
    expect(() => assertPlatformServiceToken(headers({
      authorization: "Bearer wrong",
    }), {
      PARTNERS_PLATFORM_SERVICE_TOKEN: "platform-secret",
    })).toThrow(PartnerSyncError);
  });
});
