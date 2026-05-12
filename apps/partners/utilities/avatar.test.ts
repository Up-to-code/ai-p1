import { describe, expect, it } from "vitest";
import { getAvatarInitials, getGeneratedAvatar } from "./avatar";

describe("generated partner avatar", () => {
  it("uses display names before email or subject fallbacks", () => {
    expect(getAvatarInitials({ name: "Ada Lovelace", email: "ada@example.com", subject: "auth-1" })).toBe("AL");
    expect(getAvatarInitials({ email: "grace@example.com", subject: "auth-1" })).toBe("GR");
  });

  it("keeps color stable for the same auth subject", () => {
    const first = getGeneratedAvatar({
      identity: { subject: "auth-stable", email: "ada@example.com" },
      profile: null,
      organization: null,
    });
    const second = getGeneratedAvatar({
      identity: { subject: "auth-stable", email: "ada@example.com" },
      profile: null,
      organization: null,
    });
    expect(second).toEqual(first);
  });
});
