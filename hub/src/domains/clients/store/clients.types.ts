import type { SyncState } from "@/types/common.types";

export type ClientType = "Buyer" | "Tenant" | "Investor" | "Broker";
export type ClientStatus = "active" | "inactive";
export type PipelineStage = "new" | "qualified" | "viewing" | "negotiation" | "closed";
export type Priority = "normal" | "high" | "urgent";

export interface Client {
  id: string;
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
  added: string;
  pipelineStage: PipelineStage;
  priority: Priority;
  lastContact: string;
  nextAction: string;
  nextActionDate: string;
  appointmentTime: string;
  syncState: SyncState;
  issue?: string;
}
