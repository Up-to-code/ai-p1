export type FollowUpType = "call" | "meeting" | "email" | "task";
export type FollowUpStatus = "completed" | "upcoming" | "past" | "canceled";

export interface ClientFollowUp {
  id: string;
  organizationId: string;
  clientId: string;
  type: FollowUpType;
  title: string;
  notes?: string;
  followUpDate: number;
  dueDate?: string;
  status: FollowUpStatus;
  opportunityId?: string;
  projectId?: string;
  calendarEventId?: string;
  assigneeUserId?: string;
  visibility?: "private" | "team" | "workspace";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export type ClientFollowUpPayload = {
  clientId: string;
  type: FollowUpType;
  title: string;
  notes?: string;
  followUpDate: number;
  dueDate?: string;
  status: FollowUpStatus;
  opportunityId?: string;
  projectId?: string;
  calendarEventId?: string;
  assigneeUserId?: string;
  visibility?: "private" | "team" | "workspace";
};
