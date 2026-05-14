import { z } from "zod";
import type { AgUiConversationTurn } from "@qentrah/ag-ui";
import { uploadedFileReferenceSchema } from "./files";

export const qentrahProInputModeSchema = z.enum(["text", "voice", "attachment"]);

export const qentrahProMessageMetadataSchema = z.object({
  uiTurn: z.any().optional(),
  meta: z.any().optional(),
  inputMode: qentrahProInputModeSchema.optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
});

export const qentrahProMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  uiTurn: qentrahProMessageMetadataSchema.shape.uiTurn,
  meta: qentrahProMessageMetadataSchema.shape.meta,
  inputMode: qentrahProMessageMetadataSchema.shape.inputMode,
  attachments: qentrahProMessageMetadataSchema.shape.attachments,
  createdAt: z.number(),
});

export const qentrahProThreadSchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable().optional(),
  messages: z.array(qentrahProMessageSchema),
});

export const qentrahProThreadSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable().optional(),
  updatedAt: z.number(),
});

export const sendQentrahProMessageInputSchema = z.object({
  message: z.string(),
  threadId: z.string().min(1).optional(),
  startNewThread: z.boolean().optional(),
  inputMode: qentrahProInputModeSchema.optional(),
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

export const qentrahProStreamPhaseSchema = z.enum([
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

export const qentrahProStreamStageEventSchema = z.object({
  seq: z.number(),
  phase: qentrahProStreamPhaseSchema,
  status: z.enum(["running", "completed", "failed"]).optional(),
  teamId: z.string().optional(),
  agentName: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.number(),
});

export const qentrahProStreamEventSchema = z.object({
  seq: z.number(),
  eventType: z.enum(["stage", "delta", "assistant_meta", "thread", "lifecycle", "error"]),
  phase: qentrahProStreamPhaseSchema.optional(),
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

export type QentrahProMessage = z.infer<typeof qentrahProMessageSchema>;
export type QentrahProThread = z.infer<typeof qentrahProThreadSchema>;
export type QentrahProThreadSummary = z.infer<typeof qentrahProThreadSummarySchema>;
export type SendQentrahProMessageInput = z.infer<typeof sendQentrahProMessageInputSchema>;
export type QentrahProInputMode = z.infer<typeof qentrahProInputModeSchema>;
export type TranscribeVoiceFromStorageInput = z.infer<typeof transcribeVoiceFromStorageInputSchema>;
export type TranscribeVoiceFromStorageResult = z.infer<typeof transcribeVoiceFromStorageResultSchema>;
export type QentrahProStreamStageEvent = z.infer<typeof qentrahProStreamStageEventSchema>;
export type QentrahProStreamEvent = z.infer<typeof qentrahProStreamEventSchema>;

export type QentrahProUiTurn = AgUiConversationTurn;
