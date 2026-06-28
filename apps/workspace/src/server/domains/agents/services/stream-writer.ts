const encoder = new TextEncoder();

export type AgentStreamEvent =
  | { type: "meta"; threadId: string; runId: string }
  | { type: "status"; message: string }
  | { type: "text"; text: string }
  | {
      type: "confirmation_required";
      confirmationId: string;
      summary: string;
      resource: string;
      action: string;
      approvalType?: "user" | "admin";
      inputPreview?: string;
      expiresAt: number;
    }
  | { type: "done"; threadId: string }
  | { type: "error"; error: string };

export type AgentChatAttachment = {
  key: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  kind: "image" | "video" | "document";
};

export function compact(value: unknown, maxLength = 1200) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function formatAttachmentContext(attachments: AgentChatAttachment[] | undefined) {
  if (!attachments?.length) return "";

  return `\n\nAttached files for this request:\n${attachments.map((attachment, index) => {
    const sizeMb = attachment.size > 0 ? `, ${(attachment.size / 1024 / 1024).toFixed(2)} MB` : "";
    return `${index + 1}. ${attachment.name} (${attachment.kind}, ${attachment.mimeType}${sizeMb})\n   URL: ${attachment.url}`;
  }).join("\n")}`;
}

export function encodeEvent(event: AgentStreamEvent) {
  return encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}
