import { describe, expect, it } from "vitest";
import { accountInitials, clerkMembershipOrganizationIds } from "./account-normalizers";

describe("account normalizers", () => {
  it("builds initials", () => {
    expect(accountInitials("Ada Lovelace")).toBe("AL");
  });

  it("extracts organization ids from clerk memberships", () => {
    expect(
      clerkMembershipOrganizationIds({
        organizationMemberships: [{ organization: { id: "org_1" } }, { organization: { id: "org_2" } }],
      }),
    ).toEqual(["org_1", "org_2"]);
  });
});
