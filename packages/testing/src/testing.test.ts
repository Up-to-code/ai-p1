import { describe, expect, it, vi } from "vitest";
import { buildOAuthAuthorizationPrompt } from "./oauth";
import { testId } from "./react";
import { createAsyncRepositoryMethod, createRepositoryCallLog } from "./repository";
import { createJsonRequest, readJsonResponse } from "./route";
import { buildProfileSummary, buildSessionContext } from "./session";
import { resetMocks } from "./vitest";

describe("@anan/testing", () => {
  it("builds session and profile fixtures with overrides", () => {
    expect(buildSessionContext({ role: "developer" }).role).toBe("developer");
    expect(buildProfileSummary({ showInOffersDirectory: true }).showInOffersDirectory).toBe(true);
  });

  it("builds OAuth prompt fixtures", () => {
    expect(buildOAuthAuthorizationPrompt().requestedScopes[0]?.id).toBe("properties:read");
  });

  it("provides route helpers", async () => {
    const request = createJsonRequest("https://anan.test/api", { ok: true });
    expect(await request.json()).toEqual({ ok: true });
    await expect(readJsonResponse<{ ok: boolean }>(Response.json({ ok: true }))).resolves.toEqual({ ok: true });
  });

  it("provides repository and react test helpers", async () => {
    expect(testId("submit")).toEqual({ "data-testid": "submit" });

    const log = createRepositoryCallLog(["list"] as const);
    const list = createAsyncRepositoryMethod(["item"], (args) => log.record("list", args));

    await expect(list("token")).resolves.toEqual(["item"]);
    expect(log.calls.list[0].args).toEqual(["token"]);
    log.reset();
    expect(log.calls.list).toEqual([]);
  });

  it("resets Vitest mocks", () => {
    const mock = vi.fn();
    mock("called");
    resetMocks(mock);
    expect(mock).not.toHaveBeenCalled();
  });
});
