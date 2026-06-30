import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("convex/nextjs", () => ({
  fetchAction: vi.fn(async (ref, args, options) => ({ ref, args, options, kind: "action" })),
  fetchMutation: vi.fn(async (ref, args, options) => ({ ref, args, options, kind: "mutation" })),
  fetchQuery: vi.fn(async (ref, args, options) => ({ ref, args, options, kind: "query" })),
}));

import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { createUnsafeApiRecord, getApiRefs } from "./api";
import {
  actionRef,
  createConvexHttpCalls,
  createRepositoryRefs,
  createTokenForwardingFetchers,
  mutationRef,
  publicMutationRef,
  publicQueryRef,
  queryRef,
  unwrapRepositoryField,
  unwrapRepositoryResult,
  voidMutationRef,
  withOptionalOrigin,
} from "./repository";

describe("@qentrah/convex-adapters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves app-local generated API refs without owning generated imports", () => {
    const unsafe = createUnsafeApiRecord({
      "shared_logic/oauth/clientMirror": { syncOAuthClientMirror: "sync-ref" },
    });

    expect(getApiRefs<{ syncOAuthClientMirror: unknown }>(unsafe, "shared_logic/oauth/clientMirror").syncOAuthClientMirror).toBe("sync-ref");
    expect(createRepositoryRefs<{ syncOAuthClientMirror: unknown }>(unsafe, "shared_logic/oauth/clientMirror").syncOAuthClientMirror).toBe("sync-ref");
  });

  it("omits origin when it is absent and forwards it when present", () => {
    expect(withOptionalOrigin({ secretHash: "hash", now: 1 })).toEqual({ secretHash: "hash", now: 1 });
    expect(withOptionalOrigin({ secretHash: "hash", now: 1 }, "https://app.qentrah.test")).toEqual({
      secretHash: "hash",
      now: 1,
      origin: "https://app.qentrah.test",
    });
  });

  it("unwraps repository result fields", () => {
    expect(unwrapRepositoryField({ clients: [{ id: "client-1" }] }, "clients")).toEqual([{ id: "client-1" }]);
  });

  it("unwraps repository result unions and exposes token fetcher methods", () => {
    expect(unwrapRepositoryResult({ ok: true, value: "done" })).toBe("done");
    expect(() => unwrapRepositoryResult({ ok: false, error: "failed" })).toThrow("failed");
    expect(Object.keys(createTokenForwardingFetchers("token")).sort()).toEqual(["action", "mutation", "query"]);
  });

  it("forwards tokens through shared query, mutation, and action helpers", async () => {
    await expect(queryRef("token-1", "query-ref", { limit: 3 })).resolves.toMatchObject({ kind: "query" });
    await expect(mutationRef("token-1", "mutation-ref", { id: "1" })).resolves.toMatchObject({ kind: "mutation" });
    await expect(actionRef("token-1", "action-ref", { flowId: "flow" })).resolves.toMatchObject({ kind: "action" });

    expect(fetchQuery).toHaveBeenCalledWith("query-ref", { limit: 3 }, { token: "token-1" });
    expect(fetchMutation).toHaveBeenCalledWith("mutation-ref", { id: "1" }, { token: "token-1" });
    expect(fetchAction).toHaveBeenCalledWith("action-ref", { flowId: "flow" }, { token: "token-1" });
  });

  it("supports public queries and void mutations", async () => {
    await expect(publicQueryRef("public-query", { q: "search" })).resolves.toMatchObject({ kind: "query" });
    await expect(publicMutationRef("public-mutation", { q: "write" })).resolves.toMatchObject({ kind: "mutation" });
    await expect(voidMutationRef("token-2", "void-mutation", { id: "delete-me" })).resolves.toBeUndefined();

    expect(fetchQuery).toHaveBeenCalledWith("public-query", { q: "search" });
    expect(fetchMutation).toHaveBeenCalledWith("public-mutation", { q: "write" });
    expect(fetchMutation).toHaveBeenCalledWith("void-mutation", { id: "delete-me" }, { token: "token-2" });
  });

  it("creates typed Convex HTTP call adapters", async () => {
    const client = {
      query: vi.fn(async (_ref: never, _args: never) => ({ total: 1 })),
      mutation: vi.fn(async (_ref: never, _args: never) => ({ ok: true })),
      action: vi.fn(async (_ref: never, _args: never) => ({ created: true })),
    };
    const calls = createConvexHttpCalls(client);

    await expect(calls.query<{ limit: number }, { total: number }>("query-ref", { limit: 1 })).resolves.toEqual({ total: 1 });
    await expect(calls.mutation<{ id: string }, { ok: boolean }>("mutation-ref", { id: "1" })).resolves.toEqual({ ok: true });
    await expect(calls.action<{ id: string }, { created: boolean }>("action-ref", { id: "1" })).resolves.toEqual({ created: true });
  });
});
