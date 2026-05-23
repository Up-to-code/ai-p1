import { describe, expect, it } from "vitest";
import { assertTamaraApiConfig, assertTamaraWebhookConfig, getTamaraRuntimeConfig } from "./tamara-config";

describe("Tamara runtime config", () => {
  it("uses sandbox API by default outside production", () => {
    expect(getTamaraRuntimeConfig({ NODE_ENV: "development" }).baseUrl).toBe("https://api-sandbox.tamara.co");
  });

  it("reads the Tamara public key for widget setup", () => {
    expect(getTamaraRuntimeConfig({ NODE_ENV: "development", TAMARA_PUBLIC_KEY: "pk_test" }).publicKey).toBe("pk_test");
  });

  it("rejects missing production base URL and API token", () => {
    expect(() => getTamaraRuntimeConfig({ NODE_ENV: "production" })).toThrow(/TAMARA_API_BASE_URL/u);
    expect(() => assertTamaraApiConfig({ NODE_ENV: "production", TAMARA_API_BASE_URL: "https://api.tamara.co" })).toThrow(/TAMARA_API_TOKEN/u);
  });

  it("requires a notification token for webhooks", () => {
    expect(() =>
      assertTamaraWebhookConfig({
        NODE_ENV: "production",
        TAMARA_API_BASE_URL: "https://api.tamara.co",
        TAMARA_API_TOKEN: "token",
      }),
    ).toThrow(/TAMARA_NOTIFICATION_TOKEN/u);
  });
});
