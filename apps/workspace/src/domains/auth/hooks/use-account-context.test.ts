import { describe, expect, it } from "vitest";
import { deriveAccountOrganizationPending, resolveActiveAuthOrganization } from "./use-account-context";

describe("resolveActiveAuthOrganization", () => {
  it("uses the active organization only when Better Auth returned an id", () => {
    expect(resolveActiveAuthOrganization({ id: "org_1", name: "ETJAH" })).toEqual({
      id: "org_1",
      name: "ETJAH",
    });
  });

  it("does not infer dashboard access from a listed organization fallback", () => {
    expect(resolveActiveAuthOrganization(null)).toBeNull();
    expect(resolveActiveAuthOrganization({ name: "Listed only" })).toBeNull();
  });
});

describe("deriveAccountOrganizationPending", () => {
  it("does not block workspace readiness on the full organization list", () => {
    expect(deriveAccountOrganizationPending({
      activeOrganizationPending: false,
      listedOrganizationsPending: true,
    })).toBe(false);
  });

  it("still waits for the active organization read", () => {
    expect(deriveAccountOrganizationPending({
      activeOrganizationPending: true,
      listedOrganizationsPending: false,
    })).toBe(true);
  });
});
