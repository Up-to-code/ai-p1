import { describe, expect, it } from "vitest";
import { clientTaskHref, meetingDateTimeFromTask, taskHref } from "./task-links";

describe("task links", () => {
  it("builds global task href", () => {
    expect(taskHref("task_1")).toBe("/tasks/task_1");
  });

  it("builds project-scoped task href", () => {
    expect(taskHref("task_1", { scope: "project", projectId: "proj_1" })).toBe(
      "/projects/proj_1/tasks?taskId=task_1",
    );
  });

  it("prefixes client links", () => {
    expect(clientTaskHref("client_1", "/en")).toBe("/en/clients?clientId=client_1");
  });

  it("derives meeting defaults from due date", () => {
    expect(meetingDateTimeFromTask({ dueDate: "2026-06-01" })).toEqual({
      date: "2026-06-01",
      time: "10:00",
      endTime: "10:30",
    });
  });
});
