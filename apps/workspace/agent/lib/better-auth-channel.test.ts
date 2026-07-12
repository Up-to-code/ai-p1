import { describe, expect, it } from "vitest";
import { readSessionCredential } from "./better-auth-channel";

describe("Eve Better Auth credentials", () => {
  it("accepts an explicit bearer session token", () => {
    const request = new Request("https://app.qentrah.com/api/eve", {
      headers: { authorization: "Bearer session-token" },
    });
    expect(readSessionCredential(request)).toEqual({
      token: "session-token",
      cookie: "better-auth.session_token=session-token",
    });
  });

  it("preserves production secure cookie names", () => {
    const request = new Request("https://app.qentrah.com/api/eve", {
      headers: { cookie: "theme=dark; __Secure-better-auth.session_token=signed%3Atoken; locale=en" },
    });
    expect(readSessionCredential(request)).toEqual({
      token: "signed:token",
      cookie: "__Secure-better-auth.session_token=signed%3Atoken",
    });
  });

  it("rejects unrelated cookies", () => {
    const request = new Request("https://app.qentrah.com/api/eve", {
      headers: { cookie: "theme=dark" },
    });
    expect(readSessionCredential(request)).toBeNull();
  });
});
