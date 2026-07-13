import { describe, expect, it } from "vitest";

import { readAuthEnv } from "./env";

describe("auth env reader", () => {
  it("reads brand-prefixed auth env values and trims them", () => {
    expect(readAuthEnv("QENTRAH_AUTH_ISSUER", { QENTRAH_AUTH_ISSUER: " https://auth.example.com " })).toBe("https://auth.example.com");
  });

  it("keeps direct non-brand env names available", () => {
    expect(readAuthEnv("AUTH_TEST_VALUE", { AUTH_TEST_VALUE: " enabled " })).toBe("enabled");
  });
});
