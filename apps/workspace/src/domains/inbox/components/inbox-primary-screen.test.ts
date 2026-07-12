import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { TaskRecord } from "@/domains/tasks/tasks.types";
import { buildPrimaryInboxItems } from "./inbox-primary-items";

function task(input: Partial<TaskRecord> & Pick<TaskRecord, "id" | "title">): TaskRecord {
  return {
    status: "todo",
    priority: "normal",
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

describe("buildPrimaryInboxItems", () => {
  it("shows open tasks currently assigned to the user even without notification rows", () => {
    const items = buildPrimaryInboxItems({
      events: [],
      assignedTasks: [
        task({ id: "task-1", title: "Review mobile navigation", assigneeUserIds: ["user-1"], updatedAt: 200 }),
        task({ id: "task-2", title: "Completed handoff", assigneeUserId: "user-1", status: "done", updatedAt: 300 }),
        task({ id: "task-3", title: "Other owner", assigneeUserId: "user-2", updatedAt: 400 }),
      ],
      userId: "user-1",
      filter: "all",
    });

    expect(items).toEqual([
      expect.objectContaining({
        source: "assigned_task",
        kind: "task_assigned",
        body: "Review mobile navigation",
        href: "/tasks/task-1",
      }),
    ]);
  });

  it("does not duplicate assigned tasks that already have task notification rows", () => {
    const items = buildPrimaryInboxItems({
      events: [{
        _id: "event-1" as Id<"notificationEvents">,
        kind: "task_assigned",
        resourceType: "task",
        resourceId: "task-1",
        title: "You were assigned a task",
        body: "Review mobile navigation",
        href: "/tasks/task-1",
        createdAt: 500,
      }],
      assignedTasks: [
        task({ id: "task-1", title: "Review mobile navigation", assigneeUserId: "user-1", updatedAt: 600 }),
      ],
      userId: "user-1",
      filter: "all",
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(expect.objectContaining({ source: "notification" }));
  });

  it("keeps the mentions filter scoped to mention notifications", () => {
    const items = buildPrimaryInboxItems({
      events: [{
        _id: "event-1" as Id<"notificationEvents">,
        kind: "mentioned",
        resourceType: "message",
        resourceId: "message-1",
        title: "You were mentioned in a message",
        href: "/inbox?channel=channel-1",
        createdAt: 500,
      }],
      assignedTasks: [
        task({ id: "task-1", title: "Review mobile navigation", assigneeUserId: "user-1", updatedAt: 600 }),
      ],
      userId: "user-1",
      filter: "mentions",
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(expect.objectContaining({ kind: "mentioned" }));
  });
});
