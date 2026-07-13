import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { taskAssigneeIds } from "../clientTasks/assignments";
export { taskAssigneeIds } from "../clientTasks/assignments";

type EventKind = "task_assigned" | "mentioned";
type ResourceType = "task" | "message" | "document" | "project" | "client" | "deal" | "file";

type NotificationEventInput = {
  organizationId: string;
  recipientUserId: string;
  actorUserId: string;
  kind: EventKind;
  resourceType: ResourceType;
  resourceId: string;
  title: string;
  body?: string;
  href: string;
  dedupeKey: string;
  createdAt: number;
};

type TaskAssignees = Pick<Doc<"tasks">, "assigneeUserId" | "assigneeUserIds">;

export function newlyAssignedUserIds(
  previous: TaskAssignees | null,
  next: TaskAssignees,
  actorUserId: string,
): string[] {
  const previousIds = new Set(previous ? taskAssigneeIds(previous) : []);
  return taskAssigneeIds(next).filter(
    (userId) => userId !== actorUserId && !previousIds.has(userId),
  );
}

function mentionAttribute(tag: string, attribute: string) {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return tag.match(new RegExp(`${escapedAttribute}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];
}

export function richTextMemberMentionIds(html?: string): string[] {
  if (!html) return [];
  const ids = new Set<string>();
  for (const match of html.matchAll(/<span\b[^>]*\bdata-mention(?:\s|=)[^>]*>/gi)) {
    const tag = match[0];
    const type = mentionAttribute(tag, "data-mention-type");
    const id = mentionAttribute(tag, "data-mention-id");
    if (id && (type === "member" || type === "user")) ids.add(id);
  }
  return [...ids];
}

export function newlyMentionedUserIds(
  previousHtml: string | undefined,
  nextHtml: string | undefined,
  actorUserId: string,
) {
  const previousIds = new Set(richTextMemberMentionIds(previousHtml));
  return richTextMemberMentionIds(nextHtml).filter(
    (userId) => userId !== actorUserId && !previousIds.has(userId),
  );
}

export async function createNotificationEvent(
  ctx: MutationCtx,
  input: NotificationEventInput,
) {
  if (input.recipientUserId === input.actorUserId) return null;

  const existing = await ctx.db
    .query("notificationEvents")
    .withIndex("by_dedupe", (q) =>
      q
        .eq("organizationId", input.organizationId)
        .eq("recipientUserId", input.recipientUserId)
        .eq("dedupeKey", input.dedupeKey),
    )
    .first();
  if (existing) return existing._id;

  return await ctx.db.insert("notificationEvents", input);
}

export async function emitTaskAssignmentEvents(
  ctx: MutationCtx,
  input: {
    organizationId: string;
    actorUserId: string;
    previous: TaskAssignees | null;
    task: Doc<"tasks">;
  },
) {
  const recipients = newlyAssignedUserIds(
    input.previous,
    input.task,
    input.actorUserId,
  );
  await Promise.all(recipients.map((recipientUserId) =>
    createNotificationEvent(ctx, {
      organizationId: input.organizationId,
      recipientUserId,
      actorUserId: input.actorUserId,
      kind: "task_assigned",
      resourceType: "task",
      resourceId: input.task._id,
      title: "You were assigned a task",
      body: input.task.title,
      href: `/tasks/${input.task._id}`,
      dedupeKey: `task-assigned:${input.task._id}:${input.task.updatedAt}`,
      createdAt: input.task.updatedAt,
    }),
  ));
}

export async function emitMessageMentionEvents(
  ctx: MutationCtx,
  input: {
    organizationId: string;
    actorUserId: string;
    channelId: string;
    message: Doc<"messages">;
  },
) {
  const recipients = [...new Set(
    (input.message.mentions ?? [])
      .filter((mention) => mention.type === "user")
      .map((mention) => mention.id),
  )];
  await Promise.all(recipients.map((recipientUserId) =>
    createNotificationEvent(ctx, {
      organizationId: input.organizationId,
      recipientUserId,
      actorUserId: input.actorUserId,
      kind: "mentioned",
      resourceType: "message",
      resourceId: input.message.id,
      title: "You were mentioned in a message",
      body: input.message.content.slice(0, 180),
      href: `/inbox?channel=${encodeURIComponent(input.channelId)}`,
      dedupeKey: `message-mentioned:${input.message.id}`,
      createdAt: input.message.createdAt,
    }),
  ));
}

export async function emitRichTextMentionEvents(
  ctx: MutationCtx,
  input: {
    organizationId: string;
    actorUserId: string;
    previousHtml?: string;
    nextHtml?: string;
    resourceType: "task" | "document";
    resourceId: string;
    resourceTitle: string;
    href: string;
    sourceVersion: number;
  },
) {
  const recipients = newlyMentionedUserIds(
    input.previousHtml,
    input.nextHtml,
    input.actorUserId,
  );
  await Promise.all(recipients.map((recipientUserId) =>
    createNotificationEvent(ctx, {
      organizationId: input.organizationId,
      recipientUserId,
      actorUserId: input.actorUserId,
      kind: "mentioned",
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      title: `You were mentioned in a ${input.resourceType}`,
      body: input.resourceTitle,
      href: input.href,
      dedupeKey: `${input.resourceType}-mentioned:${input.resourceId}:${input.sourceVersion}`,
      createdAt: input.sourceVersion,
    }),
  ));
}
