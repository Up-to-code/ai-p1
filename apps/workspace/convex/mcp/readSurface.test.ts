import { describe, expect, it } from "vitest";
import {
  mcpCalendarEventPage,
  mcpPublicMediaPage,
  mcpPublicWorkspacePage,
  mcpPublicWorkspaceRecords,
  mcpPublicWorkspaceSearchResult,
} from "./readSurface";

const pageBase = {
  isDone: true,
  continueCursor: "",
};

describe("MCP read surface", () => {
  it("filters workspace records to active public rows and optional search matches", () => {
    const records = [
      { _id: "public-match", visibility: "public" as const, deletedAt: undefined, name: "Noura" },
      { _id: "private", visibility: "private" as const, deletedAt: undefined, name: "Noura" },
      { _id: "deleted", visibility: "public" as const, deletedAt: 123, name: "Noura" },
      { _id: "miss", visibility: "public" as const, deletedAt: undefined, name: "Omar" },
    ];

    expect(
      mcpPublicWorkspaceRecords(records, "noura", (record) => [record.name]).map((record) => record._id),
    ).toEqual(["public-match"]);
  });

  it("presents paged public workspace rows with stable ids", () => {
    const result = mcpPublicWorkspacePage({
      ...pageBase,
      page: [
        { _id: "public", visibility: "public" as const },
        { _id: "private", visibility: "private" as const },
      ],
    });

    expect(result).toEqual({
      isDone: true,
      continueCursor: "",
      items: [{ _id: "public", visibility: "public", id: "public" }],
    });
  });

  it("returns capped search results after filtering and optional sorting", () => {
    const records = [
      { _id: "later", visibility: "public" as const, deletedAt: undefined, title: "Call", dueAt: 20 },
      { _id: "private", visibility: "private" as const, deletedAt: undefined, title: "Call", dueAt: 1 },
      { _id: "first", visibility: "public" as const, deletedAt: undefined, title: "Call", dueAt: 10 },
      { _id: "miss", visibility: "public" as const, deletedAt: undefined, title: "Email", dueAt: 5 },
    ];

    expect(
      mcpPublicWorkspaceSearchResult(records, {
        search: "call",
        limit: 1,
        searchValues: (record) => [record.title],
        sort: (a, b) => a.dueAt - b.dueAt,
      }),
    ).toEqual({
      isDone: true,
      continueCursor: "",
      items: [{ _id: "first", visibility: "public", deletedAt: undefined, title: "Call", dueAt: 10, id: "first" }],
    });
  });

  it("keeps public media sorted by sort order then creation time", () => {
    const result = mcpPublicMediaPage({
      ...pageBase,
      page: [
        { _id: "private", shareVisibility: "private", sortOrder: 0, createdAt: 0 },
        { _id: "second", shareVisibility: "public", sortOrder: 2, createdAt: 0 },
        { _id: "first", shareVisibility: "public", sortOrder: 1, createdAt: 10 },
        { _id: "earlier", shareVisibility: "public", sortOrder: 1, createdAt: 5 },
      ],
    });

    expect((result.items as Array<{ _id: string }>).map((asset) => asset._id)).toEqual(["earlier", "first", "second"]);
  });

  it("keeps active calendar events sorted by start time", () => {
    const result = mcpCalendarEventPage({
      ...pageBase,
      page: [
        { _id: "later", deletedAt: undefined, startAt: 20 },
        { _id: "deleted", deletedAt: 1, startAt: 1 },
        { _id: "first", deletedAt: undefined, startAt: 10 },
      ],
    });

    expect((result.items as Array<{ _id: string }>).map((event) => event._id)).toEqual(["first", "later"]);
  });
});
