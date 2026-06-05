import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/clerk-convex", () => ({
  fetchAuthQuery: vi.fn(),
}));
import {
  handleReadActivityIndex,
  handleReadCalendarIndex,
  handleReadClientsIndex,
  handleReadProjectsIndex,
  handleReadPropertiesIndex,
} from "./workspace-read";

function fakeContext(input: {
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
}) {
  return {
    req: {
      param: (name: string) => input.params?.[name],
      query: (name: string) => input.query?.[name],
    },
    json: (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status }),
  } as never;
}

describe("workspace read index handlers", () => {
  it.each([
    ["projects", handleReadProjectsIndex],
    ["properties", handleReadPropertiesIndex],
    ["clients", handleReadClientsIndex],
    ["activity", handleReadActivityIndex],
  ])("rejects invalid pagination for %s index", async (_name, handler) => {
    const response = await handler(fakeContext({
      params: { organizationId: "org_1" },
      query: { limit: "too-many" },
    }));

    expect(response).toBeDefined();
    const result = response as Response;
    expect(result.status).toBe(400);
    await expect(result.json()).resolves.toMatchObject({ error: "Invalid pagination query." });
  });

  it("rejects incomplete calendar ranges for the calendar index", async () => {
    const response = await handleReadCalendarIndex(fakeContext({
      params: { organizationId: "org_1" },
      query: { startAt: "10" },
    }));

    expect(response).toBeDefined();
    const result = response as Response;
    expect(result.status).toBe(400);
    await expect(result.json()).resolves.toMatchObject({
      error: "Both startAt and endAt are required for a date range.",
    });
  });
});
