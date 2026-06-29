import type {
  ClientType,
  ClientStatus,
  ClientPriority,
  Visibility,
  ClientPipelineStage,
  ClientRecord,
} from "@qentrah/domain-contracts";
export type {
  ClientType,
  ClientStatus,
  Visibility,
  ClientRecord as Client,
} from "@qentrah/domain-contracts";

export type Priority = ClientPriority;
export type PipelineStage = ClientPipelineStage;

export type ClientAssetLinkStatus = "interested" | "shortlisted" | "review" | "proposal" | "rejected";

export interface ClientAssetLink {
  id: string;
  clientId: string;
  assetId: string;
  status: ClientAssetLinkStatus;
  notes?: string;
}

export type ClientTaskStatus = "open" | "done" | "canceled";

export interface ClientTask {
  id: string;
  clientId: string;
  title: string;
  status: ClientTaskStatus;
  visibility?: Visibility;
  priority: Priority;
  dueAt?: number;
  assetId?: string;
  projectId?: string;
  calendarEventId?: string;
  notes?: string;
  completedAt?: number;
}
