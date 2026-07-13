import { describe, expect, it } from "vitest";
import {
  getDueDateColor,
  getInitials,
  removePendingTaskPatch,
  taskDocumentContext,
  STATUSES,
  PRIORITIES,
  STATUS_DOT,
  PRIORITY_COLOR,
  STATUS_COLUMN_BG,
  emptyTask,
  DEFAULT_FORM_VALUES,
} from "./tasks.constants";

describe("tasks.constants", () => {
  describe("STATUSES and PRIORITIES arrays", () => {
    it("STATUSES includes all status values", () => {
      expect(STATUSES).toEqual([
        "todo",
        "inProgress",
        "waiting",
        "done",
        "canceled",
      ]);
    });

    it("PRIORITIES includes all priority values", () => {
      expect(PRIORITIES).toEqual(["low", "normal", "high", "urgent"]);
    });
  });

  describe("visual mapping records", () => {
    it("STATUS_DOT has entries for all statuses", () => {
      for (const status of STATUSES) {
        expect(STATUS_DOT[status]).toBeDefined();
        expect(typeof STATUS_DOT[status]).toBe("string");
      }
    });

    it("PRIORITY_COLOR has entries for all priorities", () => {
      for (const priority of PRIORITIES) {
        expect(PRIORITY_COLOR[priority]).toBeDefined();
        expect(typeof PRIORITY_COLOR[priority]).toBe("string");
      }
    });

    it("STATUS_COLUMN_BG has entries for all statuses", () => {
      for (const status of STATUSES) {
        expect(STATUS_COLUMN_BG[status]).toBeDefined();
        expect(typeof STATUS_COLUMN_BG[status]).toBe("string");
      }
    });
  });

  describe("getDueDateColor", () => {
    it("returns muted color for null/undefined", () => {
      expect(getDueDateColor(null)).toBe("text-muted-foreground");
      expect(getDueDateColor(undefined)).toBe("text-muted-foreground");
    });

    it("returns red for past dates", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(getDueDateColor(past.toISOString().slice(0, 10))).toBe(
        "text-red-500",
      );
    });

    it("returns amber for today", () => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      expect(getDueDateColor(todayStr)).toBe("text-amber-500");
    });

    it("returns amber when the deadline is within two days", () => {
      const now = new Date("2026-07-12T12:00:00");
      expect(getDueDateColor("2026-07-14", now)).toBe("text-amber-500");
    });

    it("returns muted for future dates", () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(getDueDateColor(future.toISOString().slice(0, 10))).toBe(
        "text-muted-foreground",
      );
    });
  });

  describe("getInitials", () => {
    it("returns ? for undefined", () => {
      expect(getInitials(undefined)).toBe("?");
    });

    it("returns first two chars uppercase", () => {
      expect(getInitials("ahmed")).toBe("AH");
    });

    it("returns full string if less than 2 chars", () => {
      expect(getInitials("a")).toBe("A");
    });
  });

  describe("removePendingTaskPatch", () => {
    it("removes the specified task id", () => {
      const patches = {
        task_1: { status: "done" as const, pipelineOrder: 1, updatedAt: 100 },
        task_2: { status: "todo" as const, pipelineOrder: 2, updatedAt: 200 },
      };
      const result = removePendingTaskPatch(patches, "task_1");
      expect(result).toEqual({
        task_2: { status: "todo", pipelineOrder: 2, updatedAt: 200 },
      });
    });

    it("returns empty object when removing last entry", () => {
      const patches = {
        task_1: { status: "done" as const, pipelineOrder: 1, updatedAt: 100 },
      };
      expect(removePendingTaskPatch(patches, "task_1")).toEqual({});
    });

    it("returns same entries when id not found", () => {
      const patches = {
        task_1: { status: "done" as const, pipelineOrder: 1, updatedAt: 100 },
      };
      const result = removePendingTaskPatch(patches, "task_999");
      expect(Object.keys(result)).toHaveLength(1);
    });
  });

  describe("taskDocumentContext", () => {
    it("returns global scope when no project ids", () => {
      const ctx = taskDocumentContext("org_1");
      expect(ctx).toEqual({ scope: "global", organizationId: "org_1" });
    });

    it("returns project scope when routeProjectId is set", () => {
      const ctx = taskDocumentContext("org_1", "proj_1");
      expect(ctx).toEqual({
        scope: "project",
        organizationId: "org_1",
        projectId: "proj_1",
      });
    });

    it("returns project scope when taskProjectId is set", () => {
      const ctx = taskDocumentContext("org_1", null, "proj_2");
      expect(ctx).toEqual({
        scope: "project",
        organizationId: "org_1",
        projectId: "proj_2",
      });
    });

    it("routeProjectId takes precedence over taskProjectId", () => {
      const ctx = taskDocumentContext("org_1", "proj_route", "proj_task");
      expect(ctx).toEqual({
        scope: "project",
        organizationId: "org_1",
        projectId: "proj_route",
      });
    });
  });

  describe("emptyTask", () => {
    it("has todo status and normal priority", () => {
      expect(emptyTask.status).toBe("todo");
      expect(emptyTask.priority).toBe("normal");
    });

    it("has empty string defaults for optional fields", () => {
      expect(emptyTask.assigneeUserId).toBe("");
      expect(emptyTask.clientId).toBe("");
      expect(emptyTask.projectId).toBe("");
      expect(emptyTask.dueDate).toBe("");
      expect(emptyTask.description).toBe("");
      expect(emptyTask.tags).toBe("");
    });

    it("has a title", () => {
      expect(emptyTask.title).toBeTruthy();
    });
  });

  describe("DEFAULT_FORM_VALUES", () => {
    it("has empty title", () => {
      expect(DEFAULT_FORM_VALUES.title).toBe("");
    });

    it("has organization-wide visibility", () => {
      expect(DEFAULT_FORM_VALUES.visibility).toBe("workspace");
    });
  });
});
