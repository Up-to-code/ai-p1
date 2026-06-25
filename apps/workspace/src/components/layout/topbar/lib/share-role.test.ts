import { describe, expect, it } from "vitest";
import { sharePermissionToOrganizationRole } from "./share-role";

describe("sharePermissionToOrganizationRole", () => {
  it("maps editor to admin", () => {
    expect(sharePermissionToOrganizationRole("editor")).toBe("admin");
  });

  it("maps viewer to member", () => {
    expect(sharePermissionToOrganizationRole("viewer")).toBe("member");
  });
});
