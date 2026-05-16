import { describe, expect, it } from "vitest";
import { oauthClientRuntimeSyncSchema } from "./admin-partner-app.schema";

describe("admin partner app schemas", () => {
  it("accepts a Partners OAuth runtime sync payload", () => {
    const parsed = oauthClientRuntimeSyncSchema.parse({
      partnersAppId: "app_1",
      partnersClientId: "partners_client_1",
      name: "Partner CRM",
      publisherName: "Partner Co",
      description: "Submitted partner app",
      homepageUrl: "https://partner.example.com",
      redirectUris: ["https://partner.example.com/oauth/callback"],
      allowedScopes: ["client:read"],
      clientType: "confidential",
      status: "approved",
    });

    expect(parsed.partnersAppId).toBe("app_1");
  });

});
