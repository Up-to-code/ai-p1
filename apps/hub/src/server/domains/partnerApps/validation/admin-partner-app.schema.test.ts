import { describe, expect, it } from "vitest";
import {
  adminReviewPartnerAppSchema,
  partnerAppRegistrationSchema,
} from "./admin-partner-app.schema";

describe("admin partner app schemas", () => {
  it("accepts a Partners registration payload", () => {
    const parsed = partnerAppRegistrationSchema.parse({
      partnersAppId: "app_1",
      partnersClientId: "partners_client_1",
      name: "Partner CRM",
      publisherName: "Partner Co",
      description: "Submitted partner app",
      homepageUrl: "https://partner.example.com",
      redirectUris: ["https://partner.example.com/oauth/callback"],
      allowedScopes: ["client:read"],
      clientType: "confidential",
      callbackUrl: "https://partners.example.com/api/anan-review-callback",
    });

    expect(parsed.partnersAppId).toBe("app_1");
  });

  it("normalizes empty review notes", () => {
    expect(adminReviewPartnerAppSchema.parse({ status: "approved", reviewNotes: " " })).toEqual({
      status: "approved",
      reviewNotes: undefined,
    });
  });
});
