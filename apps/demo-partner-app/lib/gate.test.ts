import { describe, expect, it } from "vitest";
import { gateCookieHeader, isPublicPath, isValidGateCookie, createGateCookie } from "./gate";

const secret = "abcdefghijklmnopqrstuvwxyz123456";

describe("demo gate", () => {
  it("allows unlock and static paths without a gate cookie", () => {
    expect(isPublicPath("/unlock")).toBe(true);
    expect(isPublicPath("/api/unlock")).toBe(true);
    expect(isPublicPath("/_next/static/chunk.js")).toBe(true);
    expect(isPublicPath("/dashboard")).toBe(false);
  });

  it("signs and verifies the custom setup gate cookie", async () => {
    const cookie = await createGateCookie(secret);

    await expect(isValidGateCookie(cookie, secret)).resolves.toBe(true);
    await expect(isValidGateCookie(cookie, `${secret}x`)).resolves.toBe(false);
  });

  it("extracts the gate cookie from a cookie header", () => {
    expect(gateCookieHeader("x=1; anan_demo_gate=signed-value; y=2")).toBe("signed-value");
    expect(gateCookieHeader("x=1")).toBeUndefined();
  });
});
