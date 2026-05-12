import { describe, expect, it } from "vitest";
import {
  AUTHORIZATION_CTA_COPY,
  DEFAULT_AUTHORIZATION_EXPIRY_DAYS,
  authorizationExpiryLabel,
} from "./partner-authorization";

describe("partner authorization defaults", () => {
  it("uses the v1 organization authorization copy and expiry", () => {
    expect(AUTHORIZATION_CTA_COPY).toBe("Authorize with Anan");
    expect(DEFAULT_AUTHORIZATION_EXPIRY_DAYS).toBe(14);
    expect(authorizationExpiryLabel()).toBe("14 days");
  });
});
