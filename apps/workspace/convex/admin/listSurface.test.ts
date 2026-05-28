import { describe, expect, it } from "vitest";
import {
  adminListPage,
  adminMatchesSearch,
  adminPageWarnings,
  boundedAdminPaginationOpts,
} from "./listSurface";

describe("Admin list surface", () => {
  it("bounds admin pagination size without changing cursor state", () => {
    expect(boundedAdminPaginationOpts({ numItems: 0, cursor: "a" })).toEqual({ numItems: 1, cursor: "a" });
    expect(boundedAdminPaginationOpts({ numItems: 200, cursor: "b" })).toEqual({ numItems: 100, cursor: "b" });
    expect(boundedAdminPaginationOpts({ numItems: 50, cursor: "c" })).toEqual({ numItems: 50, cursor: "c" });
  });

  it("matches trimmed case-insensitive search values", () => {
    expect(adminMatchesSearch(undefined, ["North Gate"])).toBe(true);
    expect(adminMatchesSearch("  north ", ["North Gate"])).toBe(true);
    expect(adminMatchesSearch("south", ["North Gate", null, undefined])).toBe(false);
  });

  it("reports bounded-search warnings only when search is present", () => {
    expect(adminPageWarnings("")).toEqual([]);
    expect(adminPageWarnings("query")).toEqual([
      "Search is bounded to indexed paginated results. Use specific ids, status, or organization filters for large data sets.",
    ]);
  });

  it("maps filtered page rows with pagination metadata", () => {
    const result = adminListPage(
      {
        page: [
          { id: "1", name: "North Gate" },
          { id: "2", name: "South Gate" },
        ],
        isDone: false,
        continueCursor: "next",
      },
      {
        search: "north",
        searchValues: (record) => [record.name],
        mapRecord: (record) => ({ id: record.id, title: record.name }),
      },
    );

    expect(result).toEqual({
      rows: [{ id: "1", title: "North Gate" }],
      isDone: false,
      continueCursor: "next",
      warnings: ["Search is bounded to indexed paginated results. Use specific ids, status, or organization filters for large data sets."],
    });
  });
});
