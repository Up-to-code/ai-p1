import { describe, expect, it } from "vitest";

import { readAuthEnv } from "./env";

describe("auth env reader", () => {
  it("reads brand-prefixed auth env values and trims them", () => {
    expect(readAuthEnv("ANAN_AUTH_ISSUER", { ANAN_AUTH_ISSUER: " https://auth.example.com " })).toBe("https://auth.example.com");
  });

  it("keeps direct non-brand env names available", () => {
    expect(readAuthEnv("BETTER_AUTH_URL", { BETTER_AUTH_URL: "http://localhost:3000" })).toBe("http://localhost:3000");
  });
});
