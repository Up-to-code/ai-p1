import { describe, expect, it } from "vitest";
import { resolveWorkspaceAuthEntry } from "./utils/workspace-auth-entry";

describe("workspace auth entry", () => {
  it("keeps authenticated users in the localized workspace", () => {
    expect(resolveWorkspaceAuthEntry("ar", true)).toBe("/ar/ws");
  });

  it("keeps unauthenticated users on the same origin for sign-in", () => {
    const target = resolveWorkspaceAuthEntry("en", false);

    expect(target).toBe("/en/sign-in?callbackURL=%2Fen%2Fws");
    expect(target).not.toMatch(/^https?:\/\//u);
  });
});
