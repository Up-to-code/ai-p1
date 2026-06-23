export type ClientType = "person" | "organization";
export type ClientStatus = "new" | "active" | "nurture" | "inactive" | "archived";
export type PipelineStage = "new" | "qualified" | "review" | "negotiation" | "closed";
export type Priority = "normal" | "high" | "urgent";
export type Visibility = "private" | "team" | "workspace";

export interface Client {
  _id: string;
  _creationTime: number;
  id: string;
  organizationId: string;
  name: string;
  type: ClientType;
  ownerUserId: string;
  status: ClientStatus;
  source: string;
  visibility: Visibility;
  company?: string;
  contactName?: string;
  email?: string;
  phone: string;
  contact: string;
  website?: string;
  notes?: string;
  priority: Priority;
  budget: string;
  assetInterest: string;
  pipelineStage: PipelineStage;
  pipelineOrder?: number;
  tags?: string[];
  customFields?: Array<{ key: string; value: unknown }>;
  added: string;
  lastContact: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
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
