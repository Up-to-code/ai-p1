import { describe, expect, it } from "vitest";
import {
  buildAuthBridgeHeaders,
  createdResponse,
  copySetCookieHeaders,
  deletedResponse,
  getJsonMessage,
  handleRoute,
  invalidJsonResponse,
  isExistingAccountResponse,
  okResponse,
  parseJsonBody,
  readJsonBody,
  resolveBridgeSecret,
  safeJsonBody,
  safeResponseJson,
  validationErrorResponse,
} from "./api";
import { projectAuthenticatedSession, sanitizeInternalReturnTo } from "./auth-session";
import { createExtraFontFaceCss, createRootFontClassName } from "./fonts";
import { createLocaleCookieValue } from "./locale";
import { resolveAvatarImageUrl } from "./media";

describe("@anan/web-foundation", () => {
  it("sanitizes internal return paths", () => {
    expect(sanitizeInternalReturnTo("/ws/settings", "/ws")).toBe("/ws/settings");
    expect(sanitizeInternalReturnTo("https://evil.test", "/ws")).toBe("/ws");
    expect(sanitizeInternalReturnTo("/signin?returnTo=/ws", "/ws")).toBe("/ws");
  });

  it("projects authenticated session context", async () => {
    await expect(
      projectAuthenticatedSession(async () => ({
        token: "token",
        context: { userId: "auth-1", email: "a@test.dev", role: "broker", isActive: true },
      })),
    ).resolves.toMatchObject({
      token: "token",
      user: { id: "auth-1", email: "a@test.dev" },
      role: "broker",
    });
  });

  it("drops blocked third-party avatar hosts", () => {
    expect(resolveAvatarImageUrl("https://lh3.googleusercontent.com/avatar")).toBeNull();
    expect(resolveAvatarImageUrl("/avatars/a.png")).toBe("/avatars/a.png");
  });

  it("shares route response, locale, and font helpers", async () => {
    const response = invalidJsonResponse();
    await expect(response.json()).resolves.toMatchObject({ code: "INVALID_REQUEST", status: 400 });
    await expect(readJsonBody(new Request("https://app.test", { method: "POST", body: "{" }))).rejects.toMatchObject({
      code: "INVALID_REQUEST",
    });
    await expect(readJsonBody(new Request("https://app.test", { method: "POST", body: "{\"a\":1}" }), 4)).rejects.toMatchObject({
      code: "PAYLOAD_TOO_LARGE",
      status: 413,
    });
    expect(createLocaleCookieValue("fr")).toBe("fr");
    expect(createLocaleCookieValue("bad")).toBe("ar");
    expect(createRootFontClassName("font-a", "font-b")).toBe("font-a font-b antialiased font-sans");
    expect(createExtraFontFaceCss({ cairoFontFamily: "Cairo", monoFontFamily: "Mono" })).toContain("font-family: \"Cairo\"");
  });

  it("shares API route JSON, validation, and response helpers", async () => {
    const validRequest = new Request("https://app.test", { method: "POST", body: "{\"name\":\"Anan\"}" });
    await expect(
      parseJsonBody(validRequest, {
        safeParse: (input) =>
          typeof input === "object" && input !== null && "name" in input
            ? { success: true, data: input as { name: string } }
            : { success: false, error: { issues: [{ message: "Name is required" }] } },
      }),
    ).resolves.toEqual({ name: "Anan" });

    const invalidRequest = new Request("https://app.test", { method: "POST", body: "{}" });
    await expect(
      parseJsonBody(invalidRequest, {
        safeParse: () => ({ success: false, error: { issues: [{ message: "Name is required" }] } }),
      }),
    ).rejects.toMatchObject({ code: "INVALID_ARGUMENT", status: 400 });

    await expect(safeJsonBody(new Request("https://app.test", { method: "POST", body: "{" }), { ok: false })).resolves.toEqual({
      ok: false,
    });
    expect(okResponse().status).toBe(200);
    expect(createdResponse({ id: "1" }).status).toBe(201);
    expect(deletedResponse(null).status).toBe(204);
    expect(validationErrorResponse().status).toBe(400);
    await expect(handleRoute(() => ({ ok: true })).then((response) => response.json())).resolves.toEqual({ ok: true });
  });

  it("shares signup bridge response helpers", async () => {
    const source = new Response("{}", { headers: { "set-cookie": "session=abc; Path=/" } });
    const target = new Response("{}");
    copySetCookieHeaders(source, target);
    expect(target.headers.get("set-cookie")).toContain("session=abc");
    await expect(safeResponseJson(new Response("{"), { ok: false })).resolves.toEqual({ ok: false });
    expect(isExistingAccountResponse(409, {})).toBe(true);
    expect(isExistingAccountResponse(400, { message: "Already exists" })).toBe(true);
    expect(getJsonMessage({ message: "Nope" }, "Fallback")).toBe("Nope");
    expect(resolveBridgeSecret([{ header: "x-test", value: " secret " }], "missing")).toEqual({
      header: "x-test",
      value: "secret",
    });
    expect(buildAuthBridgeHeaders({
      bridgeHeader: "x-test-secret",
      bridgeSecret: "secret",
      cookie: "session=abc",
      requestUrl: "http://localhost:3002/api/external-signup",
    })).toEqual({
      "content-type": "application/json",
      "x-test-secret": "secret",
      cookie: "session=abc",
      origin: "http://localhost:3002",
      referer: "http://localhost:3002/api/external-signup",
    });
  });
});
