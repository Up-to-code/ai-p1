import { describe, expect, it } from "vitest";
import { applyWorkOSProxyHeaders } from "./proxy-headers";

function headerValues(value: string | null) {
  return new Set(value?.split(",").map((item) => item.trim()).filter(Boolean) ?? []);
}

describe("applyWorkOSProxyHeaders", () => {
  it("preserves AuthKit request overrides while keeping next-intl response headers", () => {
    const response = new Response(null, {
      headers: {
        "x-middleware-rewrite": "http://localhost:3000/en/dashboard",
        "x-middleware-override-headers": "accept-language",
        "x-middleware-request-accept-language": "en",
      },
    });
    const workosHeaders = new Headers({
      "cache-control": "no-store",
      "set-cookie": "wos-session=sealed; Path=/; HttpOnly; SameSite=Lax",
      "vary": "Cookie",
      "x-middleware-next": "1",
      "x-middleware-override-headers": "x-url,x-workos-middleware,x-workos-session,x-redirect-uri",
      "x-middleware-request-x-redirect-uri": "http://localhost:3000/callback",
      "x-middleware-request-x-url": "http://localhost:3000/en/dashboard",
      "x-middleware-request-x-workos-middleware": "true",
      "x-middleware-request-x-workos-session": "sealed-session",
    });

    const merged = applyWorkOSProxyHeaders(response, workosHeaders);
    const overrideHeaders = headerValues(merged.headers.get("x-middleware-override-headers"));

    expect(merged.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/en/dashboard");
    expect(merged.headers.get("x-middleware-next")).toBeNull();
    expect(merged.headers.get("cache-control")).toBe("no-store");
    expect(merged.headers.get("set-cookie")).toContain("wos-session=sealed");
    expect(merged.headers.get("vary")).toContain("Cookie");
    expect(overrideHeaders).toEqual(new Set([
      "accept-language",
      "x-url",
      "x-workos-middleware",
      "x-workos-session",
      "x-redirect-uri",
    ]));
    expect(merged.headers.get("x-middleware-request-accept-language")).toBe("en");
    expect(merged.headers.get("x-middleware-request-x-url")).toBe("http://localhost:3000/en/dashboard");
    expect(merged.headers.get("x-middleware-request-x-workos-middleware")).toBe("true");
    expect(merged.headers.get("x-middleware-request-x-workos-session")).toBe("sealed-session");
    expect(merged.headers.get("x-middleware-request-x-redirect-uri")).toBe("http://localhost:3000/callback");
  });
});
