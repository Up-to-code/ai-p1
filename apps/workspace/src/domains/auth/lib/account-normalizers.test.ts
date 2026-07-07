import { describe, expect, it } from "vitest";
import { accountInitials } from "./account-normalizers";

describe("account normalizers", () => {
  it("builds initials", () => {
    expect(accountInitials("Ada Lovelace")).toBe("AL");
  });
});
