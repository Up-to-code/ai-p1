import { z } from "zod";
import type { AgUiConversationTurn } from "@anan/ag-ui";
import { uploadedFileReferenceSchema } from "./files";

export const ananProInputModeSchema = z.enum(["text", "voice", "attachment"]);

export const ananProMessageMetadataSchema = z.object({
  uiTurn: z.any().optional(),
  meta: z.any().optional(),
  inputMode: ananProInputModeSchema.optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
});

export const ananProMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  uiTurn: ananProMessageMetadataSchema.shape.uiTurn,
  meta: ananProMessageMetadataSchema.shape.meta,
  inputMode: ananProMessageMetadataSchema.shape.inputMode,
  attachments: ananProMessageMetadataSchema.shape.attachments,
  createdAt: z.number(),
});

export const ananProThreadSchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable().optional(),
  messages: z.array(ananProMessageSchema),
});

export const ananProThreadSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable().optional(),
  updatedAt: z.number(),
});

export const sendAnanProMessageInputSchema = z.object({
  message: z.string(),
  threadId: z.string().min(1).optional(),
  startNewThread: z.boolean().optional(),
  inputMode: ananProInputModeSchema.optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
  streamSessionId: z.string().min(1).optional(),
  regenerate: z.boolean().optional(),
  regenerateMessageId: z.string().min(1).optional(),
}).superRefine((value, ctx) => {
  const hasMessage = value.message.trim().length > 0;
  const hasAttachments = (value.attachments?.length ?? 0) > 0;
  if (!hasMessage && !hasAttachments) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Message text or at least one attachment is required.",
      path: ["message"],
    });
  }
});

export const ananProStreamPhaseSchema = z.enum([
  "intent_started",
  "intent_done",
  "team_started",
  "team_done",
  "merge_started",
  "merge_done",
  "action_started",
  "action_done",
  "persist_started",
  "persist_done",
]);

export const ananProStreamStageEventSchema = z.object({
  seq: z.number(),
  phase: ananProStreamPhaseSchema,
  status: z.enum(["running", "completed", "failed"]).optional(),
  teamId: z.string().optional(),
  agentName: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.number(),
});

export const ananProStreamEventSchema = z.object({
  seq: z.number(),
  eventType: z.enum(["stage", "delta", "assistant_meta", "thread", "lifecycle", "error"]),
  phase: ananProStreamPhaseSchema.optional(),
  status: z.enum(["running", "completed", "failed", "cancelled"]).optional(),
  teamId: z.string().optional(),
  agentName: z.string().optional(),
  delta: z.string().optional(),
  threadId: z.string().optional(),
  title: z.string().optional(),
  meta: z.unknown().optional(),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.number(),
});

export const transcribeVoiceFromStorageInputSchema = z.object({
  storageId: z.string().min(1),
});

export const transcribeVoiceFromStorageResultSchema = z.object({
  text: z.string().min(1),
  languageCode: z.string().optional(),
});

export type AnanProMessage = z.infer<typeof ananProMessageSchema>;
export type AnanProThread = z.infer<typeof ananProThreadSchema>;
export type AnanProThreadSummary = z.infer<typeof ananProThreadSummarySchema>;
export type SendAnanProMessageInput = z.infer<typeof sendAnanProMessageInputSchema>;
export type AnanProInputMode = z.infer<typeof ananProInputModeSchema>;
export type TranscribeVoiceFromStorageInput = z.infer<typeof transcribeVoiceFromStorageInputSchema>;
export type TranscribeVoiceFromStorageResult = z.infer<typeof transcribeVoiceFromStorageResultSchema>;
export type AnanProStreamStageEvent = z.infer<typeof ananProStreamStageEventSchema>;
export type AnanProStreamEvent = z.infer<typeof ananProStreamEventSchema>;

export type AnanProUiTurn = AgUiConversationTurn;
