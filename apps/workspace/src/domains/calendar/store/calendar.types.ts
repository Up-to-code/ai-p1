export interface CalendarEvent {
  _id?: string;
  id: string;
  organizationId?: string;
  title: string;
  ownerUserId?: string;
  startAt?: number;
  endAt?: number;
  date: string;
  time: string;
  type: "meeting" | "deadline" | "reminder" | "milestone" | "focusBlock";
  status: "confirmed" | "pending" | "draft";
  clientId?: string;
  projectId?: string;
  taskId?: string;
  clientName?: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  attendeeUserIds?: string[];
  externalAttendees?: string[];
  tags?: string[];
  customFields?: unknown[];
}
