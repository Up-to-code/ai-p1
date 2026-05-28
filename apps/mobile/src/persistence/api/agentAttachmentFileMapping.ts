import type { AgentAttachmentKind, PendingAgentAttachment, UploadedAgentAttachment } from "@/types/domain";

export type AgentAttachmentAssetInput = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

export type AgentAttachmentUploadResultFile = {
  key?: string;
  url?: string;
  ufsUrl?: string;
  name?: string;
  type?: string;
  size?: number;
  serverData?: {
    key?: string;
    url?: string;
    name?: string;
    mimeType?: string;
    size?: number;
  };
};

function createAttachmentId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function inferAgentAttachmentKind(mimeType: string): AgentAttachmentKind {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export function agentAttachmentNameFromUri(uri: string) {
  return decodeURIComponent(uri.split("/").pop() || "attachment");
}

export function createPendingAgentAttachment(
  input: AgentAttachmentAssetInput,
  options: { id?: string } = {},
): PendingAgentAttachment {
  const mimeType = input.mimeType || "application/octet-stream";
  const name = input.name || agentAttachmentNameFromUri(input.uri);
  return {
    id: options.id ?? createAttachmentId(),
    uri: input.uri,
    name,
    mimeType,
    size: input.size ?? undefined,
    kind: inferAgentAttachmentKind(mimeType),
    uploadStatus: "pending",
    uploadProgress: 0,
  };
}

export function resolveUploadBeginAttachmentId(fileName: string, attachments: PendingAgentAttachment[]) {
  return attachments.find((candidate) => candidate.name === fileName)?.id ?? null;
}

export function resolveUploadProgressAttachmentId(
  file: { name?: string; attachmentId?: string },
  attachments: PendingAgentAttachment[],
) {
  return file.attachmentId ?? attachments.find((candidate) => candidate.name === file.name)?.id ?? null;
}

export function uploadedAgentAttachmentFromResult(
  file: AgentAttachmentUploadResultFile,
  fallback?: PendingAgentAttachment,
): UploadedAgentAttachment {
  const serverData = file.serverData;
  const mimeType = serverData?.mimeType || file.type || fallback?.mimeType || "application/octet-stream";
  return {
    key: serverData?.key || file.key || "",
    url: serverData?.url || file.url || file.ufsUrl || "",
    name: serverData?.name || file.name || fallback?.name || "attachment",
    mimeType,
    size: serverData?.size || file.size || fallback?.size || 0,
    kind: inferAgentAttachmentKind(mimeType),
  };
}
