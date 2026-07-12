import type { Id } from "@convex/_generated/dataModel";
import type { TaskRecord } from "@/domains/tasks/tasks.types";

export type PrimaryFilter = "all" | "mentions" | "assigned";

export type NotificationEvent = {
  _id: Id<"notificationEvents">;
  kind: "task_assigned" | "mentioned";
  resourceType: string;
  resourceId: string;
  title: string;
  body?: string;
  href: string;
  readAt?: number;
  createdAt: number;
};

export type PrimaryInboxItem =
  | {
      id: string;
      source: "notification";
      eventId: Id<"notificationEvents">;
      kind: "task_assigned" | "mentioned";
      title: string;
      body?: string;
      href: string;
      readAt?: number;
      createdAt: number;
    }
  | {
      id: string;
      source: "assigned_task";
      kind: "task_assigned";
      title: string;
      body?: string;
      href: string;
      readAt: number;
      createdAt: number;
    };

function taskIsAssignedToUser(task: TaskRecord, userId: string) {
  return task.assigneeUserId === userId || task.assigneeUserIds?.includes(userId) === true;
}

function taskIsOpen(task: TaskRecord) {
  const status = task.status.toLowerCase();
  return status !== "done" && status !== "complete" && status !== "completed" && status !== "canceled";
}

export function buildPrimaryInboxItems({
  events,
  assignedTasks,
  userId,
  filter,
}: {
  events: NotificationEvent[];
  assignedTasks: TaskRecord[];
  userId: string;
  filter: PrimaryFilter;
}): PrimaryInboxItem[] {
  const taskNotificationIds = new Set(
    events
      .filter((event) => event.kind === "task_assigned" && event.resourceType === "task")
      .map((event) => event.resourceId),
  );
  const notificationItems: PrimaryInboxItem[] = events.map((event) => ({
    id: `notification:${event._id}`,
    source: "notification",
    eventId: event._id,
    kind: event.kind,
    title: event.title,
    body: event.body,
    href: event.href,
    readAt: event.readAt,
    createdAt: event.createdAt,
  }));
  const taskItems: PrimaryInboxItem[] = assignedTasks
    .filter((task) => taskIsAssignedToUser(task, userId))
    .filter(taskIsOpen)
    .filter((task) => !taskNotificationIds.has(task.id))
    .map((task) => ({
      id: `assigned-task:${task.id}`,
      source: "assigned_task",
      kind: "task_assigned",
      title: "Task assigned to you",
      body: task.title,
      href: `/tasks/${task.id}`,
      readAt: task.updatedAt,
      createdAt: task.updatedAt,
    }));
  const items = [...notificationItems, ...taskItems].sort((a, b) => b.createdAt - a.createdAt);
  if (filter === "mentions") return items.filter((item) => item.kind === "mentioned");
  if (filter === "assigned") return items.filter((item) => item.kind === "task_assigned");
  return items;
}
