export interface CalendarEvent {
  _id?: string;
  id: string;
  organizationId?: string;
  title: string;
  owner: string;
  startAt?: number;
  endAt?: number;
  date: string;
  time: string;
  type: "meeting" | "deadline" | "reminder" | "milestone" | "focusBlock";
  status: "confirmed" | "pending" | "draft";
  clientId?: string;
  assetId?: string;
  projectId?: string;
  taskId?: string;
  clientName?: string;
  assetTitle?: string;
  location?: string;
  notes?: string;
  customFields?: Array<{ label: string; value: string }>;
}
