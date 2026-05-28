import type { PendingAgentAttachment } from "@/types/domain";

export type AttachmentUploadProgressUpdate = {
  id: string;
  progress: number;
  status: NonNullable<PendingAgentAttachment["uploadStatus"]>;
  error?: string;
};

export function clampUploadProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
