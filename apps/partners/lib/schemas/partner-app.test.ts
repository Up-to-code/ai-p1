import { describe, expect, it } from "vitest";
import { getStatusTone } from "@/lib/navigation";
import { partnerAppFormSchema } from "./partner-app";

describe("partner portal schemas", () => {
  it("normalizes redirect URIs and scopes from textarea input", () => {
    const parsed = partnerAppFormSchema.parse({
      name: "Partner CRM",
      publisherName: "Acme",
      homepageUrl: "https://partner.example.com",
      clientType: "public",
      redirectUris: "https://app.example.com/oauth/callback\nhttp://localhost:3000/callback",
      allowedScopes: "client:read\nproperty:read",
    });

    expect(parsed.redirectUris).toEqual([
      "https://app.example.com/oauth/callback",
      "http://localhost:3000/callback",
    ]);
    expect(parsed.homepageUrl).toBe("https://partner.example.com");
    expect(parsed.allowedScopes).toEqual(["client:read", "property:read"]);
  });

  it("rejects insecure redirect URIs and malformed scopes", () => {
    expect(() =>
      partnerAppFormSchema.parse({
        name: "P",
        publisherName: "A",
        homepageUrl: "https://partner.example.com",
        clientType: "public",
        redirectUris: "http://evil.example/callback",
        allowedScopes: "Clients Read",
      }),
    ).toThrow();
  });

  it("rejects self-serve delete scopes", () => {
    expect(() =>
      partnerAppFormSchema.parse({
        name: "Partner CRM",
        publisherName: "Acme",
        homepageUrl: "https://partner.example.com",
        clientType: "public",
        redirectUris: "https://app.example.com/oauth/callback",
        allowedScopes: "client:delete",
      }),
    ).toThrow();
  });

  it("maps all partner app status tones", () => {
    expect(getStatusTone("active")).toBe("success");
    expect(getStatusTone("pending_review")).toBe("warning");
    expect(getStatusTone("rejected")).toBe("danger");
    expect(getStatusTone("draft")).toBe("default");
  });
});
