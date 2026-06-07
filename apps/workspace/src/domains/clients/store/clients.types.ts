import type { SyncState } from "@/types/common.types";

export type ClientType = "person" | "organization";
export type ClientStatus = "new" | "active" | "nurture" | "inactive" | "archived";
export type PipelineStage = "new" | "qualified" | "review" | "negotiation" | "closed";
export type Priority = "normal" | "high" | "urgent";
export type Visibility = "private" | "team" | "workspace";

export interface Client {
  _id?: string;
  id: string;
  organizationId?: string;
  name: string;
  type: ClientType;
  contact: string;
  phone: string;
  age: number;
  nationality: string;
  generation: string;
  budget: string;
  assetInterest: string;
  status: ClientStatus;
  visibility?: Visibility;
  added: string;
  pipelineStage: PipelineStage;
  pipelineOrder?: number;
  priority: Priority;
  lastContact: string;
  nextAction: string;
  nextActionDate: string;
  appointmentTime: string;
  syncState: SyncState;
  issue?: string;
  createdAt?: number;
  updatedAt?: number;
}

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
