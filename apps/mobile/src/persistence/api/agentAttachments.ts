import * as DocumentPicker from "expo-document-picker";
import { genUploader } from "uploadthing/client";

import {
  clampUploadProgress,
  type AttachmentUploadProgressUpdate,
} from "@/persistence/api/agentAttachmentProgress";
import {
  createPendingAgentAttachment,
  resolveUploadBeginAttachmentId,
  resolveUploadProgressAttachmentId,
  uploadedAgentAttachmentFromResult,
  type AgentAttachmentUploadResultFile,
} from "@/persistence/api/agentAttachmentFileMapping";
import { buildWorkspaceApiUrl, workspaceApiFetch } from "@/persistence/api/workspaceApiClient";
import type { PendingAgentAttachment, UploadedAgentAttachment } from "@/types/domain";

type UploadThingFile = File & { uri?: string; attachmentId?: string };

const { uploadFiles } = genUploader<any>({
  url: buildWorkspaceApiUrl("/api/uploadthing"),
  package: "qentrah",
  fetch: (input, init) => {
    if (typeof input === "string" && input.startsWith("file:")) {
      return fetch(input, init);
    }
    if (input instanceof URL && input.protocol === "file:") {
      return fetch(input, init);
    }
    return workspaceApiFetch(String(input), init as RequestInit);
  },
});

export async function pickAgentMediaAttachments() {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
    type: ["image/*", "video/*"],
  });

  if (result.canceled) return [];

  return result.assets.map((asset) =>
    createPendingAgentAttachment({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
    }),
  );
}

export async function pickAgentDocumentAttachments() {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
    type: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/*",
    ],
  });

  if (result.canceled) return [];

  return result.assets.map((asset) =>
    createPendingAgentAttachment({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
    }),
  );
}

async function toUploadThingFile(attachment: PendingAgentAttachment): Promise<UploadThingFile> {
  const blob = await fetch(attachment.uri).then((response) => response.blob());
  const file = new File([blob], attachment.name, { type: attachment.mimeType }) as UploadThingFile;
  file.uri = attachment.uri;
  file.attachmentId = attachment.id;
  return file;
}

export async function uploadAgentMessageAttachments(
  organizationId: string,
  attachments: PendingAgentAttachment[],
  options: {
    onProgress?: (update: AttachmentUploadProgressUpdate) => void;
  } = {},
): Promise<UploadedAgentAttachment[]> {
  if (attachments.length === 0) return [];

  const files = await Promise.all(attachments.map(toUploadThingFile));
  const uploaded = await uploadFiles("agentMessageAttachment", {
    files,
    input: { organizationId },
    concurrency: 2,
    onUploadBegin: ({ file }: { file: string }) => {
      const attachmentId = resolveUploadBeginAttachmentId(file, attachments);
      if (!attachmentId) return;
      options.onProgress?.({
        id: attachmentId,
        progress: 1,
        status: "uploading",
      });
    },
    onUploadProgress: ({
      file,
      progress,
    }: {
      file: UploadThingFile;
      progress: number;
    }) => {
      const attachmentId = resolveUploadProgressAttachmentId(file, attachments);
      if (!attachmentId) return;
      options.onProgress?.({
        id: attachmentId,
        progress: clampUploadProgress(progress),
        status: progress >= 100 ? "uploaded" : "uploading",
      });
    },
  } as any);

  return (uploaded as AgentAttachmentUploadResultFile[]).map((file, index) => {
    const fallback = attachments[index];
    const result = uploadedAgentAttachmentFromResult(file, fallback);
    if (fallback) {
      options.onProgress?.({
        id: fallback.id,
        progress: 100,
        status: "uploaded",
      });
    }
    return result;
  });
}
