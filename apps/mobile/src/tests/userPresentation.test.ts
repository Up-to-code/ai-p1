import test from "node:test";
import assert from "node:assert/strict";

import {
  userAvatarPresentation,
  userDisplayName,
  userInitials,
} from "@/auth/userPresentation";

test("user presentation prefers name, then email, then fallback", () => {
  assert.equal(userDisplayName({ name: "Noura Ahmed", email: "noura@example.com" }), "Noura Ahmed");
  assert.equal(userDisplayName({ email: "noura@example.com" }), "noura@example.com");
  assert.equal(userDisplayName(null), "Qentrah user");
});

test("user initials are derived once for account surfaces", () => {
  assert.equal(userInitials("Noura Ahmed"), "NA");
  assert.equal(userInitials("noura@example.com"), "N");
  assert.equal(userInitials(""), "Q");
});

test("user avatar presentation bundles display name, image, and initials", () => {
  assert.deepEqual(userAvatarPresentation({
    name: "Noura Ahmed",
    email: "noura@example.com",
    image: "https://example.com/avatar.png",
  }), {
    displayName: "Noura Ahmed",
    avatarUrl: "https://example.com/avatar.png",
    initials: "NA",
  });
});
