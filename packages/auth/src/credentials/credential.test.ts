import { describe, expect, it } from "vitest";

import {
  authCredentialHeaders,
  readAuthCredential,
  redactAuthCredential,
} from "./credential.js";

describe("auth credentials", () => {
  it("prefers an explicit bearer token over cookies", () => {
    expect(readAuthCredential(new Headers({
      authorization: "Bearer access-token",
      cookie: "better-auth.session_token=session-token",
    }))).toEqual({ kind: "bearer", token: "access-token" });
  });

  it.each([
    ["better-auth.session_token", "plain-token"],
    ["__Secure-better-auth.session_token", "signed%3Atoken"],
    ["__Host-better-auth.session_token", "host-token"],
  ])("reads the %s cookie", (cookieName, encodedToken) => {
    expect(readAuthCredential(new Request("https://app.example.test", {
      headers: { cookie: `theme=dark; ${cookieName}=${encodedToken}; locale=en` },
    }))).toEqual({
      kind: "session",
      token: decodeURIComponent(encodedToken),
      cookieName,
      cookie: `${cookieName}=${encodedToken}`,
    });
  });

  it("fails closed for empty and malformed credentials", () => {
    expect(readAuthCredential(new Headers({ authorization: "Basic abc" }))).toBeNull();
    expect(readAuthCredential(new Headers({ cookie: "better-auth.session_token; theme=dark" }))).toBeNull();
    expect(readAuthCredential(new Headers({ cookie: "better-auth.session_token=" }))).toBeNull();
  });

  it("does not throw when an opaque cookie contains malformed percent encoding", () => {
    expect(readAuthCredential(new Headers({
      cookie: "better-auth.session_token=signed%token",
    }))).toEqual(expect.objectContaining({ token: "signed%token" }));
  });

  it("creates outgoing headers and redacts every credential kind", () => {
    const bearer = { kind: "bearer", token: "access-token" } as const;
    const session = readAuthCredential(new Headers({
      cookie: "__Secure-better-auth.session_token=session-token",
    }));

    expect(authCredentialHeaders(bearer).get("authorization")).toBe("Bearer access-token");
    expect(authCredentialHeaders(session).get("cookie")).toBe("__Secure-better-auth.session_token=session-token");
    expect(redactAuthCredential(bearer)).toBe("Bearer [REDACTED]");
    expect(redactAuthCredential(session)).toBe("__Secure-better-auth.session_token=[REDACTED]");
    expect(redactAuthCredential(null)).toBe("none");
  });
});
