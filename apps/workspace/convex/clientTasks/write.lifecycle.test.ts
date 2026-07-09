import { describe, expect, it } from "vitest";
import { taskCompletionPatch } from "./write";

describe("client task completion lifecycle", () => {
  it("sets completedAt when entering done", () => {
    expect(taskCompletionPatch({ existingStatus: "todo", nextStatus: "done", now: 200 })).toEqual({ completedAt: 200 });
  });

  it("preserves completedAt for a done to done update", () => {
    expect(taskCompletionPatch({ existingStatus: "done", nextStatus: "done", existingCompletedAt: 100, now: 200 })).toEqual({ completedAt: 100 });
  });

  it("clears completedAt when reopening a task", () => {
    expect(taskCompletionPatch({ existingStatus: "done", nextStatus: "inProgress", existingCompletedAt: 100, now: 200 })).toEqual({ completedAt: undefined });
  });

  it("sets a fresh timestamp when recompleting a reopened task", () => {
    expect(taskCompletionPatch({ existingStatus: "inProgress", nextStatus: "done", existingCompletedAt: undefined, now: 300 })).toEqual({ completedAt: 300 });
  });

  it("preserves completion state for non-status updates", () => {
    expect(taskCompletionPatch({ existingStatus: "done", nextStatus: "done", existingCompletedAt: 100, now: 200 })).toEqual({ completedAt: 100 });
    expect(taskCompletionPatch({ existingStatus: "todo", nextStatus: "todo", now: 200 })).toEqual({ completedAt: undefined });
  });
});
