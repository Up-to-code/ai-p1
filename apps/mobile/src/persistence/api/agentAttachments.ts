import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { genUploader } from "uploadthing/client";

import { buildWorkspaceApiUrl, workspaceApiFetch } from "@/persistence/api/workspaceApiClient";
import type { AgentAttachmentKind, PendingAgentAttachment, UploadedAgentAttachment } from "@/types/domain";

type UploadThingFile = File & { uri?: string };

const { uploadFiles } = genUploader<any>({
  url: buildWorkspaceApiUrl("/api/uploadthing"),
  package: "qentrah-mobile",
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

function inferAttachmentKind(mimeType: string): AgentAttachmentKind {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

function attachmentNameFromUri(uri: string) {
  return decodeURIComponent(uri.split("/").pop() || "attachment");
}

function createAttachment(input: {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
}): PendingAgentAttachment {
  const mimeType = input.mimeType || "application/octet-stream";
  const name = input.name || attachmentNameFromUri(input.uri);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    uri: input.uri,
    name,
    mimeType,
    size: input.size ?? undefined,
    kind: inferAttachmentKind(mimeType),
  };
}

export async function pickAgentMediaAttachments() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Media library permission is required to attach images or videos.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsMultipleSelection: true,
    quality: 0.92,
  });

  if (result.canceled) return [];

  return result.assets.map((asset) =>
    createAttachment({
      uri: asset.uri,
      name: asset.fileName,
      mimeType: asset.mimeType,
      size: asset.fileSize,
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
    createAttachment({
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
  return file;
}

export async function uploadAgentMessageAttachments(
  organizationId: string,
  attachments: PendingAgentAttachment[],
): Promise<UploadedAgentAttachment[]> {
  if (attachments.length === 0) return [];

  const files = await Promise.all(attachments.map(toUploadThingFile));
  const uploaded = await uploadFiles("agentMessageAttachment", {
    files,
    input: { organizationId },
  } as any);

  return uploaded.map((file: any, index: number) => {
    const fallback = attachments[index];
    const serverData = file.serverData;
    const mimeType = serverData?.mimeType || file.type || fallback?.mimeType || "application/octet-stream";
    return {
      key: serverData?.key || file.key,
      url: serverData?.url || file.url || file.ufsUrl,
      name: serverData?.name || file.name || fallback?.name || "attachment",
      mimeType,
      size: serverData?.size || file.size || fallback?.size || 0,
      kind: inferAttachmentKind(mimeType),
    };
  });
}
