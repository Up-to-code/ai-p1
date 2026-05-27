import type { AssistantAction, AssistantSource, AssistantStageEvent, AssistantTurn } from "@/conversation/assistantProtocol";

export type AnalyticsEventName =
  | "app_open"
  | "screen_view"
  | "ai_prompt_sent"
  | "ai_response_stream_start"
  | "ai_response_stream_end"
  | "voice_input_started"
  | "voice_input_completed"
  | "ai_suggestion_clicked"
  | "contact_agent"
  | "schedule_visit";

export type ConversationRole = "user" | "assistant";
export type ConversationKind =
  | "text"
  | "assistant_turn";
export type StreamState = "idle" | "streaming" | "complete" | "stopped";
export type VoiceMode = "idle" | "requesting_permission" | "listening" | "transcribing" | "failed";

export type AgentAttachmentKind = "image" | "video" | "document";

export type PendingAgentAttachment = {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  kind: AgentAttachmentKind;
};

export type UploadedAgentAttachment = {
  key: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  kind: AgentAttachmentKind;
};

export type ConversationTurnMeta = {
  runId?: string;
  workflowId?: string;
  sources?: AssistantSource[];
  diagnostics?: string[];
  confirmation?: {
    confirmationId: string;
    summary: string;
    resource: string;
    action: string;
    inputPreview?: string;
    expiresAt: number;
    status?: "pending" | "approved" | "canceled" | "executed" | "failed";
  };
};

export type ConversationMessage = {
  id: string;
  sessionId: string;
  role: ConversationRole;
  kind: ConversationKind;
  text: string;
  streamState: StreamState;
  relatedPropertyIds: string[];
  attachments?: UploadedAgentAttachment[];
  createdAt: number;
  runId?: string;
  sourceMetadata?: { title: string; url: string; snippet: string }[];
  uiTurn?: AssistantTurn;
  turnMeta?: ConversationTurnMeta;
};

export type ConversationTurnAction = AssistantAction;
export type ConversationRunStage = AssistantStageEvent;

export type ConversationRunStatus = {
  runId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  summary?: string;
  diagnostics: string[];
  workflowId?: string;
  route?: AssistantTurn["route"];
  specialist?: string;
  motionPreset?: AssistantTurn["motion"]["preset"];
  startedAt?: number;
  completedAt?: number;
  updatedAt: number;
  stopRequestedAt?: number;
};

export type AgentRuntimeHealth = {
  status: "loading" | "ready" | "unavailable";
  auth?: {
    anonymousEnabled: boolean;
    emailPasswordEnabled: boolean;
  };
  llm?: {
    configured: boolean;
    provider: "openrouter" | "openai" | null;
  };
  webSearch?: {
    configured: boolean;
  };
  featureVersion?: string;
  capabilities?: {
    sendMessage: boolean;
    threadMessages: boolean;
    stageFeed: boolean;
    runStatus: boolean;
    workflowRuns: boolean;
  };
  workflow?: {
    configured: boolean;
    provider: string;
  };
  worker?: {
    configured: boolean;
    available?: boolean;
    lastHeartbeatAt?: number;
    staleAfterMs?: number;
  };
  message?: string;
};

export type InsightCard = {
  id: string;
  title: string;
  body: string;
  tone: "signal" | "neutral";
};
