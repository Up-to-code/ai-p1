import { describe, expect, it } from "vitest";
import { createLocaleAuthCallbackUrl, resolveAuthEntryCallbackUrl } from "./utils/auth-callback-url";

describe("auth callback url helpers", () => {
  it("builds localized auth callbacks", () => {
    expect(createLocaleAuthCallbackUrl("ar", "/choose-org")).toBe("/ar/choose-org");
    expect(createLocaleAuthCallbackUrl("en", "choose-org")).toBe("/en/choose-org");
  });

  it("normalizes app-shell callbacks to organization selection", () => {
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/dashboard")).toBe("/ar/choose-org");
    expect(resolveAuthEntryCallbackUrl("en", "/en/projects/project_1")).toBe("/en/choose-org");
  });

  it("preserves safe auth callbacks and invite query parameters", () => {
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/choose-org")).toBe("/ar/choose-org");
    expect(resolveAuthEntryCallbackUrl("ar", "/ar/accept-invite?inviteToken=invite_1")).toBe("/ar/accept-invite?inviteToken=invite_1");
  });

  it("rejects missing, cross-locale, and absolute callbacks", () => {
    expect(resolveAuthEntryCallbackUrl("ar", null)).toBe("/ar/choose-org");
    expect(resolveAuthEntryCallbackUrl("ar", "/en/choose-org")).toBe("/ar/choose-org");
    expect(resolveAuthEntryCallbackUrl("ar", "https://app.qentrah.com/ar/dashboard")).toBe("/ar/choose-org");
  });
});
