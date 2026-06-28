import { describe, expect, it } from "vitest";
import { createLocaleAuthCallbackUrl, resolveAuthEntryCallbackUrl } from "./utils/auth-callback-url";

describe("auth callback url helpers", () => {
  it("builds localized auth callbacks", () => {
    expect(createLocaleAuthCallbackUrl("ar", "/choose-org")).toBe("/ar/choose-org");
    expect(createLocaleAuthCallbackUrl("en", "choose-org")).toBe("/en/choose-org");
  });

  it("normalizes app-shell callbacks to organization selection", () => {
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/ws")).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("en", "/en/projects/project_1")).toBe("/en/ws");
  });

  it("preserves safe auth callbacks and invite query parameters", () => {
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/choose-org")).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/accept-invite?inviteToken=invite_1")).toBe("/ar/accept-invite?inviteToken=invite_1");
  });

  it("rejects missing, cross-locale, and absolute callbacks", () => {
    expect(resolveAuthEntryCallbackUrl("ar", null)).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("ar", "/en/choose-org")).toBe("/ar/ws");
    expect(resolveAuthEntryCallbackUrl("ar", "https://app.qentrah.com/ar/ws")).toBe("/ar/ws");
  });
});
