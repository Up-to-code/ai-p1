import { describe, expect, it } from "vitest";
import { resolveConvexAuthConfigEnv } from "./auth.config";

describe("Convex auth config environment", () => {
  it("uses the server Convex site URL when present", () => {
    expect(resolveConvexAuthConfigEnv({
      CONVEX_SITE_URL: " https://server.convex.site ",
      NEXT_PUBLIC_CONVEX_SITE_URL: "https://public.convex.site",
    })).toEqual({
      siteUrl: "https://server.convex.site",
      jwksUrl: "https://server.convex.site/api/auth/convex/jwks",
    });
  });

  it("falls back to the public Convex site URL used by Next local dev", () => {
    expect(resolveConvexAuthConfigEnv({
      NEXT_PUBLIC_CONVEX_SITE_URL: "https://public.convex.site",
    })).toEqual({
      siteUrl: "https://public.convex.site",
      jwksUrl: "https://public.convex.site/api/auth/convex/jwks",
    });
  });
});
