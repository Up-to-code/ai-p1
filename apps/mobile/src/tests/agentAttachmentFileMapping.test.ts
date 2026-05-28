import test from "node:test";
import assert from "node:assert/strict";

import {
  agentAttachmentNameFromUri,
  createPendingAgentAttachment,
  inferAgentAttachmentKind,
  resolveUploadBeginAttachmentId,
  resolveUploadProgressAttachmentId,
  uploadedAgentAttachmentFromResult,
} from "@/persistence/api/agentAttachmentFileMapping";
import type { PendingAgentAttachment } from "@/types/domain";

function pending(id: string, name = `${id}.jpg`): PendingAgentAttachment {
  return createPendingAgentAttachment(
    {
      uri: `file:///tmp/${encodeURIComponent(name)}`,
      name,
      mimeType: "image/jpeg",
      size: 1024,
    },
    { id },
  );
}

test("attachment file mapping infers kind and normalized pending assets", () => {
  assert.equal(inferAgentAttachmentKind("image/png"), "image");
  assert.equal(inferAgentAttachmentKind("video/mp4"), "video");
  assert.equal(inferAgentAttachmentKind("application/pdf"), "document");
  assert.equal(agentAttachmentNameFromUri("file:///tmp/floor%20plan.pdf"), "floor plan.pdf");

  const attachment = createPendingAgentAttachment(
    { uri: "file:///tmp/floor%20plan.pdf", mimeType: null, size: null },
    { id: "fixed-id" },
  );

  assert.deepEqual(attachment, {
    id: "fixed-id",
    uri: "file:///tmp/floor%20plan.pdf",
    name: "floor plan.pdf",
    mimeType: "application/octet-stream",
    size: undefined,
    kind: "document",
    uploadStatus: "pending",
    uploadProgress: 0,
  });
});

test("attachment upload identity resolves begin and progress events", () => {
  const attachments = [pending("first", "same-name.jpg"), pending("second", "second.jpg")];

  assert.equal(resolveUploadBeginAttachmentId("same-name.jpg", attachments), "first");
  assert.equal(resolveUploadBeginAttachmentId("missing.jpg", attachments), null);
  assert.equal(resolveUploadProgressAttachmentId({ name: "second.jpg" }, attachments), "second");
  assert.equal(resolveUploadProgressAttachmentId({ name: "same-name.jpg", attachmentId: "explicit" }, attachments), "explicit");
  assert.equal(resolveUploadProgressAttachmentId({ name: "missing.jpg" }, attachments), null);
});

test("uploaded attachment projection prefers server data then upload file then fallback", () => {
  const fallback = pending("fallback", "fallback.pdf");
  const withServer = uploadedAgentAttachmentFromResult({
    key: "client-key",
    url: "https://client",
    name: "client.jpg",
    type: "image/jpeg",
    size: 12,
    serverData: {
      key: "server-key",
      url: "https://server",
      name: "server.mp4",
      mimeType: "video/mp4",
      size: 34,
    },
  }, fallback);

  assert.deepEqual(withServer, {
    key: "server-key",
    url: "https://server",
    name: "server.mp4",
    mimeType: "video/mp4",
    size: 34,
    kind: "video",
  });

  assert.deepEqual(uploadedAgentAttachmentFromResult({ key: "k", ufsUrl: "https://ufs" }, fallback), {
    key: "k",
    url: "https://ufs",
    name: "fallback.pdf",
    mimeType: "image/jpeg",
    size: 1024,
    kind: "image",
  });
});
