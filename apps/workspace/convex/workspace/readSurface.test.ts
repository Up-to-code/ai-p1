import { describe, expect, it } from "vitest";
import {
  activeChronologicalWorkspaceRows,
  activeDueWorkspaceRows,
  activeUpdatedWorkspaceRows,
  activeWorkspaceRows,
  boundedWorkspaceReadLimit,
  presentActiveWorkspacePage,
  workspaceSearchRows,
} from "./readSurface";

describe("Workspace Convex read surface", () => {
  it("centralizes active row filtering and updated sorting", () => {
    expect(activeWorkspaceRows([{ id: "a" }, { id: "deleted", deletedAt: 1 }])).toEqual([{ id: "a" }]);
    expect(activeUpdatedWorkspaceRows([
      { id: "old", updatedAt: 1 },
      { id: "deleted", updatedAt: 3, deletedAt: 1 },
      { id: "new", updatedAt: 2 },
    ])).toEqual([
      { id: "new", updatedAt: 2 },
      { id: "old", updatedAt: 1 },
    ]);
  });

  it("orders active schedule rows by start and active task rows by due date", () => {
    expect(activeChronologicalWorkspaceRows([
      { id: "late", startAt: 30 },
      { id: "deleted", startAt: 10, deletedAt: 1 },
      { id: "early", startAt: 20 },
    ])).toEqual([
      { id: "early", startAt: 20 },
      { id: "late", startAt: 30 },
    ]);

    expect(activeDueWorkspaceRows([
      { id: "later", dueAt: 20 },
      { id: "unscheduled" },
      { id: "deleted", dueAt: 1, deletedAt: 1 },
      { id: "soon", dueAt: 10 },
    ])).toEqual([
      { id: "soon", dueAt: 10 },
      { id: "later", dueAt: 20 },
      { id: "unscheduled" },
    ]);
  });

  it("bounds small read limits with existing minimum and maximum behavior", () => {
    expect(boundedWorkspaceReadLimit(undefined, 100, 200)).toBe(100);
    expect(boundedWorkspaceReadLimit(0, 100, 200)).toBe(1);
    expect(boundedWorkspaceReadLimit(500, 100, 200)).toBe(200);
  });

  it("filters active search rows by optional status and capped matching values", () => {
    const rows = [
      { id: "a", status: "approved", name: "North Tower" },
      { id: "b", status: "draft", name: "North Draft" },
      { id: "c", status: "approved", name: "South", deletedAt: 1 },
      { id: "d", status: "approved", name: "North Annex" },
    ];

    expect(workspaceSearchRows(rows, {
      search: " north ",
      status: "approved",
      getStatus: (row) => row.status,
      searchValues: (row) => [row.name],
      limit: 1,
    })).toEqual([{ id: "a", status: "approved", name: "North Tower" }]);
  });

  it("presents active paged rows only", async () => {
    await expect(presentActiveWorkspacePage(
      [{ id: "a" }, { id: "deleted", deletedAt: 1 }],
      async (row) => ({ key: row.id }),
    )).resolves.toEqual([{ key: "a" }]);
  });
});
