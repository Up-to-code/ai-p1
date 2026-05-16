import { describe, expect, it } from "vitest";
import { createPartnerWebhookEndpointSchema } from "./partner-app.schema";

describe("partner webhook endpoint validation", () => {
  const base = {
    partnerAppId: "partner_app_1",
    events: ["client.created"],
  };

  it("accepts public HTTPS webhook URLs", () => {
    expect(createPartnerWebhookEndpointSchema.parse({
      ...base,
      url: "https://webhooks.example.com/qentrah",
    })).toMatchObject({ url: "https://webhooks.example.com/qentrah" });
  });

  it("rejects local and private network webhook URLs", () => {
    for (const url of [
      "http://webhooks.example.com/qentrah",
      "https://localhost/qentrah",
      "https://127.0.0.1/qentrah",
      "https://10.0.0.8/qentrah",
      "https://172.16.1.10/qentrah",
      "https://192.168.1.10/qentrah",
      "https://169.254.169.254/latest/meta-data",
      "https://user:pass@webhooks.example.com/qentrah",
    ]) {
      expect(() => createPartnerWebhookEndpointSchema.parse({ ...base, url })).toThrow();
    }
  });
});
