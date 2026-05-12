import { describe, expect, it, vi, afterEach } from "vitest";
import {
  readEnumQuery,
  readPaginationQuery,
  readSearchQuery,
  readTimeRangeQuery,
  withWorkspaceReadTimeout,
  WorkspaceReadTimeoutError,
  workspaceReadMessage,
  workspaceReadStatus,
} from "./workspace-read-helper";

describe("workspace read helper", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the operation result when the read finishes before timeout", async () => {
    const operation = vi.fn().mockResolvedValue({ ok: true });

    await expect(withWorkspaceReadTimeout("clients list", operation, 100)).resolves.toEqual({ ok: true });
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("rejects with a timeout error when the read takes too long", async () => {
    vi.useFakeTimers();
    const operation = vi.fn(() => new Promise(() => undefined));

    const request = withWorkspaceReadTimeout("clients list", operation, 50);
    const assertion = expect(request).rejects.toBeInstanceOf(WorkspaceReadTimeoutError);
    await vi.advanceTimersByTimeAsync(50);

    await assertion;
  });

  it("maps auth, permission, timeout, and generic failures to useful statuses", () => {
    expect(workspaceReadStatus(new Error("Unauthenticated"))).toBe(401);
    expect(workspaceReadStatus(new Error("You do not have permission to read this organization client."))).toBe(403);
    expect(workspaceReadStatus(new WorkspaceReadTimeoutError("clients list"))).toBe(504);
    expect(workspaceReadStatus(new Error("rate limited"))).toBe(429);
    expect(workspaceReadStatus(new Error("Unexpected"))).toBe(500);
    expect(workspaceReadMessage(new Error("Unauthenticated"))).toBe("Sign in again to load workspace data.");
    expect(workspaceReadMessage(new Error("You do not have permission to read this organization client."))).toBe("You do not have permission to load this workspace data.");
    expect(workspaceReadMessage(new WorkspaceReadTimeoutError("clients list"))).toContain("too long");
    expect(workspaceReadMessage(new Error("database secret"))).toBe("Workspace data could not be loaded.");
  });

  it("validates pagination query params instead of silently coercing bad values", async () => {
    const ok = readPaginationQuery({
      req: {
        query: (name: string) => ({ limit: "25", cursor: "next" } satisfies Record<string, string>)[name],
      },
      json: (payload: unknown, status: number) => new Response(JSON.stringify(payload), { status }),
    } as never);

    expect(ok).toEqual({ ok: true, data: { numItems: 25, cursor: "next" } });

    const bad = readPaginationQuery({
      req: {
        query: (name: string) => ({ limit: "abc" } satisfies Record<string, string>)[name],
      },
      json: (payload: unknown, status: number) => new Response(JSON.stringify(payload), { status }),
    } as never);

    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.response.status).toBe(400);
      await expect(bad.response.json()).resolves.toMatchObject({ error: "Invalid pagination query." });
    }
  });

  it("validates enum, search, and time range query params", () => {
    const context = {
      req: {
        query: (name: string) => ({
          status: "draft",
          search: " Ahmed ",
          startAt: "10",
          endAt: "20",
        } satisfies Record<string, string>)[name],
      },
      json: (payload: unknown, status: number) => new Response(JSON.stringify(payload), { status }),
    } as never;

    expect(readEnumQuery(context, "status", ["draft", "approved"] as const)).toEqual({ ok: true, data: "draft" });
    expect(readSearchQuery(context)).toEqual({ ok: true, data: "Ahmed" });
    expect(readTimeRangeQuery(context, { requireBoth: true })).toEqual({ ok: true, data: { startAt: 10, endAt: 20 } });
  });
});
