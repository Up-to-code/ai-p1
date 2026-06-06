import type { PendingAgentAttachment, UploadedAgentAttachment } from "@/types/domain";
import {
  clampUploadProgress,
  type AttachmentUploadProgressUpdate,
} from "@/persistence/api/agentAttachmentProgress";

export type { AttachmentUploadProgressUpdate };

const MAX_COMPOSER_ATTACHMENT_PREVIEWS = 5;
const MAX_MESSAGE_ATTACHMENT_PREVIEWS = 5;
const MAX_PENDING_AGENT_ATTACHMENTS = 24;

export function mergePendingAgentAttachments(
  current: PendingAgentAttachment[],
  incoming: PendingAgentAttachment[],
) {
  if (incoming.length === 0) return current;
  const bySignature = new Map<string, PendingAgentAttachment>();
  for (const attachment of [...current, ...incoming]) {
    bySignature.set(`${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`, attachment);
  }
  return [...bySignature.values()].slice(0, MAX_PENDING_AGENT_ATTACHMENTS);
}

export function getVisibleComposerAttachments(attachments: PendingAgentAttachment[]) {
  return {
    visible: attachments.slice(0, MAX_COMPOSER_ATTACHMENT_PREVIEWS),
    overflowCount: Math.max(0, attachments.length - MAX_COMPOSER_ATTACHMENT_PREVIEWS),
  };
}

export function getVisibleMessageAttachments(attachments: UploadedAgentAttachment[] | undefined) {
  const items = attachments ?? [];
  return {
    visible: items.slice(0, MAX_MESSAGE_ATTACHMENT_PREVIEWS),
    overflowCount: Math.max(0, items.length - MAX_MESSAGE_ATTACHMENT_PREVIEWS),
  };
}

export function composerAttachmentProgressPercent(attachment: PendingAgentAttachment) {
  return clampUploadProgress(attachment.uploadProgress ?? 0);
}

export function removePendingAgentAttachment(attachments: PendingAgentAttachment[], attachmentId: string) {
  return attachments.filter((attachment) => attachment.id !== attachmentId);
}

export function applyAttachmentProgress(
  attachments: PendingAgentAttachment[],
  update: AttachmentUploadProgressUpdate,
) {
  return attachments.map((attachment) =>
    attachment.id === update.id
      ? {
          ...attachment,
          uploadProgress: clampUploadProgress(update.progress),
          uploadStatus: update.status,
          uploadError: update.error,
        }
      : attachment,
  );
}

export function markAttachmentsUploading(attachments: PendingAgentAttachment[]) {
  return attachments.map((attachment) => ({
    ...attachment,
    uploadProgress: Math.max(1, attachment.uploadProgress ?? 0),
    uploadStatus: "uploading" as const,
    uploadError: undefined,
  }));
}

export function markAttachmentsFailed(attachments: PendingAgentAttachment[], error: string) {
  return attachments.map((attachment) => ({
    ...attachment,
    uploadStatus: attachment.uploadStatus === "uploaded" ? attachment.uploadStatus : "error" as const,
    uploadError: attachment.uploadStatus === "uploaded" ? attachment.uploadError : error,
  }));
}
