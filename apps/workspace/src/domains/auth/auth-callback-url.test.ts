import { describe, expect, it } from "vitest";
import { createLocaleAuthCallbackUrl, resolveAuthEntryCallbackUrl } from "./utils/auth-callback-url";

describe("auth callback url helpers", () => {
  it("builds localized auth callbacks", () => {
    expect(createLocaleAuthCallbackUrl("ar", "/choose-org")).toBe("/ar/choose-org");
    expect(createLocaleAuthCallbackUrl("en", "choose-org")).toBe("/en/choose-org");
  });

  it("preserves app-shell callbacks and query strings", () => {
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/ws")).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("en", "/en/projects/project_1")).toBe("/en/projects/project_1");
    expect(resolveAuthEntryCallbackUrl("en", "/en/inbox?channel=abc&state=xyz")).toBe("/en/inbox?channel=abc&state=xyz");
  });

  it("preserves safe auth callbacks and invite query parameters", () => {
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/choose-org")).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/choose-org?callbackURL=%2Far%2Finbox%3Fchannel%3D1")).toBe("/ar/inbox?channel=1");
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/accept-invite?inviteToken=invite_1")).toBe("/ar/accept-invite?inviteToken=invite_1");
  });

  it("rejects missing, cross-locale, and absolute callbacks", () => {
    expect(resolveAuthEntryCallbackUrl("ar", null)).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("ar", "/en/choose-org")).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("ar", "https://app.qentrah.com/ar/ws")).toBe("/ar/ws");
  });
});
