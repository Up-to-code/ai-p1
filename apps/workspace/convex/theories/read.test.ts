import { describe, expect, it } from "vitest";
import { canReadTheory, readableTheoriesForUser } from "./read";

const organizationId = "org_1";

function theory(overrides: Partial<Parameters<typeof canReadTheory>[0]> = {}) {
  return {
    organizationId,
    createdByUserId: "user_creator",
    isPrivate: false,
    ...overrides,
  };
}

describe("theory read privacy", () => {
  it("keeps private theories creator-only, including for organization admins", () => {
    const privateTheory = theory({ isPrivate: true });

    expect(canReadTheory(privateTheory, organizationId, "user_creator")).toBe(true);
    expect(canReadTheory(privateTheory, organizationId, "user_member")).toBe(false);
    expect(canReadTheory(privateTheory, organizationId, "user_admin")).toBe(false);
  });

  it("returns shared theories to organization members while filtering other users' private records", () => {
    const theories = [
      theory({ createdByUserId: "user_creator", isPrivate: true }),
      theory({ createdByUserId: "user_member", isPrivate: true }),
      theory({ createdByUserId: "user_creator", isPrivate: false }),
      theory({ organizationId: "org_2", createdByUserId: "user_creator", isPrivate: false }),
    ];

    expect(
      readableTheoriesForUser(theories, organizationId, "user_member").map((item) => item.createdByUserId),
    ).toEqual(["user_member", "user_creator"]);
  });

  it("rejects cross-organization and deleted theories before applying visibility", () => {
    expect(canReadTheory(theory({ organizationId: "org_2" }), organizationId, "user_creator")).toBe(false);
    expect(canReadTheory(theory({ deletedAt: 1 }), organizationId, "user_creator")).toBe(false);
  });
});
