import { describe, expect, it } from "vitest";
import { normalizeDomainError } from "./errors";
import { updateProfileInputSchema } from "./profiles";
import type { AdminOAuthAuthorizationPrompt } from "./oauth";

describe("@qentrah/domain-contracts", () => {
  it("keeps platform error normalization available", () => {
    expect(
      normalizeDomainError({
        data: { code: "VERIFICATION_REQUIRED", message: "Verification needed" },
      }).status,
    ).toBe(403);
  });

  it("accepts web profile directory visibility while keeping it optional", () => {
    expect(
      updateProfileInputSchema.parse({
        name: "Ahmed Mansour",
        username: "ahmed.mansour",
        showInOffersDirectory: true,
      }).showInOffersDirectory,
    ).toBe(true);
  });

  it("keeps admin OAuth prompts narrower than web prompts", () => {
    const adminPrompt = {
      flowId: "flow-1",
      client: { clientId: "client-1", name: "External Publisher", publisherName: "Qentrah" },
      user: { email: "admin@qentrah.test" },
      state: "state",
      redirectUri: "https://app.test/callback",
      requestedScopes: [{ id: "properties:read", label: "Read properties" }],
      offlineAccess: false,
      requiresConsent: true,
      existingAuthorization: null,
    } satisfies AdminOAuthAuthorizationPrompt;

    expect(adminPrompt).not.toHaveProperty("organizations");
  });
});
