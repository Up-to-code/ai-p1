import type { SyncState } from "@/types/common.types";

export type ClientType = "Buyer" | "Tenant" | "Investor" | "Broker";
export type ClientStatus = "active" | "inactive";
export type PipelineStage = "new" | "qualified" | "viewing" | "negotiation" | "closed";
export type Priority = "normal" | "high" | "urgent";
export type Visibility = "private" | "public";

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
  propertyInterest: string;
  status: ClientStatus;
  visibility?: Visibility;
  added: string;
  pipelineStage: PipelineStage;
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

export type ClientUnitLinkStatus = "interested" | "shortlisted" | "viewing" | "offer" | "rejected";

export interface ClientUnitLink {
  id: string;
  clientId: string;
  propertyId: string;
  status: ClientUnitLinkStatus;
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
  propertyId?: string;
  projectId?: string;
  calendarEventId?: string;
  notes?: string;
  completedAt?: number;
}
