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
  type: "visit" | "call" | "meeting" | "client-visit" | "site-viewing" | "appointment" | "signing" | "follow-up" | "handover" | "audit" | "custom";
  status: "confirmed" | "pending" | "draft";
  clientId?: string;
  unitId?: string;
  propertyId?: string;
  projectId?: string;
  taskId?: string;
  clientName?: string;
  unitTitle?: string;
  location?: string;
  notes?: string;
  customFields?: Array<{ label: string; value: string }>;
}
