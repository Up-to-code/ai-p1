import type { AssistantAction, AssistantSource, AssistantStageEvent, AssistantTurn } from "@/conversation/assistantProtocol";

export type AnalyticsEventName =
  | "app_open"
  | "screen_view"
  | "ai_prompt_sent"
  | "ai_response_stream_start"
  | "ai_response_stream_end"
  | "voice_input_started"
  | "voice_input_completed"
  | "property_impression"
  | "property_click"
  | "property_save"
  | "property_compare"
  | "ai_suggestion_clicked"
  | "contact_agent"
  | "schedule_visit";

export type ConversationRole = "user" | "assistant";
export type ConversationKind =
  | "text"
  | "assistant_turn";
export type StreamState = "idle" | "streaming" | "complete" | "stopped";
export type VoiceMode = "idle" | "requesting_permission" | "listening" | "transcribing" | "failed";

export type ConversationTurnMeta = {
  runId?: string;
  workflowId?: string;
  sources?: AssistantSource[];
  diagnostics?: string[];
};

export type ConversationMessage = {
  id: string;
  sessionId: string;
  role: ConversationRole;
  kind: ConversationKind;
  text: string;
  streamState: StreamState;
  relatedPropertyIds: string[];
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

export type AmenityVM = {
  id: string;
  label: string;
  iconName: string; // corresponds to lucide-react-native icon
  category?: string; // e.g. "Wellness", "Accessibility"
};

export type BrokerVM = {
  id: string;
  name: string;
  agency: string;
  avatarUrl: string;
  rating: number;
  activeListingsCount: number;
  phone: string;
  description: string;
};

export type PriceAnalysisVM = {
  propertyAskPrice: number;
  areaAveragePrice: number;
  historicalData: { month: string; value: number }[]; // for rendering chart
};

export type PropertyCardVM = {
  id: string;
  heroUrl: string;
  imageUrls?: string[];
  title: string;
  description?: string; // added description
  priceLabel: string;
  locationLabel: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  beds: number;
  baths: number;
  area: number;
  matchScore: number;
  matchReasons: string[];
  aiSummary: string;
  tags: string[];
  amenities: AmenityVM[];
  broker: BrokerVM;
  priceAnalysis: PriceAnalysisVM;
  developerName?: string;
  compoundName?: string;
};

export type PreferenceProfile = {
  budgetRange: [number, number];
  locations: string[];
  bedrooms: number[];
  propertyTypes: string[];
  commutePrefs: string[];
  confidence: number;
  updatedFrom: string;
};

export type AgentRunResult = {
  summary: string;
  rankedProperties: PropertyCardVM[];
  preferenceUpdates: Partial<PreferenceProfile>;
  diagnostics: string[];
};

export type InsightCard = {
  id: string;
  title: string;
  body: string;
  tone: "signal" | "neutral";
};
