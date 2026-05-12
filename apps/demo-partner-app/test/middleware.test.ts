import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { gateCookieName } from "@/lib/cookies";
import { createGateCookie } from "@/lib/gate";
import { proxy } from "../proxy";

const secret = "abcdefghijklmnopqrstuvwxyz123456";

describe("middleware gate", () => {
  it("redirects locked requests to unlock", async () => {
    process.env.SESSION_SECRET = secret;
    const response = await proxy(new NextRequest("http://localhost:3004/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3004/unlock?returnTo=%2Fdashboard");
  });

  it("allows requests with a valid gate cookie", async () => {
    process.env.SESSION_SECRET = secret;
    const cookie = await createGateCookie(secret);
    const response = await proxy(new NextRequest("http://localhost:3004/dashboard", {
      headers: { cookie: `${gateCookieName}=${cookie}` },
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
