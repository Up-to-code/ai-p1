import { describe, expect, it } from "vitest";
import {
  threadReplyRecipientIds,
  newlyAssignedUserIds,
  newlyMentionedUserIds,
  richTextMemberMentionIds,
  taskAssigneeIds,
} from "./inbox_events";

describe("primary inbox event recipients", () => {
  it("notifies existing thread participants once and never notifies the author", () => {
    expect(
      threadReplyRecipientIds(["author", "member", "member", "other"], "author"),
    ).toEqual(["member", "other"]);
  });
  it("normalizes singular and plural task assignees", () => {
    expect(taskAssigneeIds({
      assigneeUserId: "user-1",
      assigneeUserIds: ["user-1", "user-2"],
    })).toEqual(["user-1", "user-2"]);
  });

  it("only emits for newly assigned users and excludes the actor", () => {
    expect(newlyAssignedUserIds(
      { assigneeUserId: "user-1", assigneeUserIds: ["user-2"] },
      { assigneeUserId: "user-1", assigneeUserIds: ["user-2", "user-3", "actor"] },
      "actor",
    )).toEqual(["user-3"]);
  });

  it("extracts member mentions from serialized editor HTML", () => {
    const html = [
      '<span data-mention data-mention-id="user-1" data-mention-name="Sam" data-mention-type="member">Sam</span>',
      '<span data-mention-type="task" data-mention-id="task-1" data-mention>Task</span>',
      '<span data-mention data-mention-id="user-1" data-mention-type="member">Sam</span>',
      '<span data-mention data-mention-id="user-2" data-mention-type="user">Lee</span>',
    ].join("");

    expect(richTextMemberMentionIds(html)).toEqual(["user-1", "user-2"]);
  });

  it("only emits for newly added rich-text mentions", () => {
    const mention = (id: string) =>
      `<span data-mention data-mention-id="${id}" data-mention-type="member">User</span>`;
    expect(newlyMentionedUserIds(
      mention("user-1"),
      `${mention("user-1")}${mention("user-2")}${mention("actor")}`,
      "actor",
    )).toEqual(["user-2"]);
  });
});
