import test from "node:test";
import assert from "node:assert/strict";

import {
  applyAttachmentProgress,
  composerAttachmentProgressPercent,
  getVisibleComposerAttachments,
  getVisibleMessageAttachments,
  markAttachmentsFailed,
  markAttachmentsUploading,
  mergePendingAgentAttachments,
  removePendingAgentAttachment,
} from "@/conversation/lib/agentAttachmentPresentation";
import { clampUploadProgress } from "@/persistence/api/agentAttachmentProgress";
import type { PendingAgentAttachment } from "@/types/domain";

function attachment(id: string, uri = `file:///tmp/${id}.jpg`): PendingAgentAttachment {
  return {
    id,
    uri,
    name: `${id}.jpg`,
    mimeType: "image/jpeg",
    kind: "image",
    size: 1024,
    uploadStatus: "pending",
    uploadProgress: 0,
  };
}

test("composer attachment preview shows five files and overflow count", () => {
  const attachments = Array.from({ length: 8 }, (_, index) => attachment(`file-${index}`));

  const result = getVisibleComposerAttachments(attachments);

  assert.equal(result.visible.length, 5);
  assert.equal(result.overflowCount, 3);
});

test("message attachment preview uses the shared five-file policy", () => {
  const attachments = Array.from({ length: 7 }, (_, index) => ({
    key: `key-${index}`,
    url: `https://example.com/${index}.jpg`,
    name: `${index}.jpg`,
    mimeType: "image/jpeg",
    kind: "image" as const,
    size: 1024,
  }));

  const result = getVisibleMessageAttachments(attachments);

  assert.equal(result.visible.length, 5);
  assert.equal(result.overflowCount, 2);
  assert.deepEqual(getVisibleMessageAttachments(undefined), { visible: [], overflowCount: 0 });
});

test("pending attachment merge dedupes by file signature", () => {
  const first = attachment("first", "file:///tmp/duplicate.jpg");
  const duplicate = { ...attachment("second", "file:///tmp/duplicate.jpg"), name: first.name, size: first.size };

  const result = mergePendingAgentAttachments([first], [duplicate]);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, duplicate.id);
});

test("attachment upload progress is clamped and applied by id", () => {
  const result = applyAttachmentProgress([attachment("a"), attachment("b")], {
    id: "b",
    progress: 140,
    status: "uploading",
  });

  assert.equal(result[0].uploadProgress, 0);
  assert.equal(result[1].uploadProgress, 100);
  assert.equal(result[1].uploadStatus, "uploading");
  assert.equal(clampUploadProgress(-12), 0);
  assert.equal(clampUploadProgress(Number.NaN), 0);
  assert.equal(composerAttachmentProgressPercent({ ...attachment("c"), uploadProgress: 240 }), 100);
  assert.equal(composerAttachmentProgressPercent({ ...attachment("d"), uploadProgress: -4 }), 0);
});

test("attachment upload state helpers preserve completed uploads", () => {
  const uploading = markAttachmentsUploading([attachment("a")]);

  assert.equal(uploading[0].uploadStatus, "uploading");
  assert.equal(uploading[0].uploadProgress, 1);

  const failed = markAttachmentsFailed([
    { ...attachment("done"), uploadStatus: "uploaded", uploadProgress: 100 },
    attachment("bad"),
  ], "network failed");

  assert.equal(failed[0].uploadStatus, "uploaded");
  assert.equal(failed[1].uploadStatus, "error");
  assert.equal(failed[1].uploadError, "network failed");
});

test("pending attachment removal is owned by the presentation module", () => {
  const result = removePendingAgentAttachment([attachment("a"), attachment("b")], "a");

  assert.deepEqual(result.map((item) => item.id), ["b"]);
});
