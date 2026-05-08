export interface CalendarEvent {
  id: string;
  title: string;
  owner: string;
  date: string;
  time: string;
  type: "client-visit" | "site-viewing" | "appointment" | "signing" | "follow-up" | "handover" | "audit" | "custom";
  status: "confirmed" | "pending" | "draft";
  clientId?: string;
  unitId?: string;
  location?: string;
  notes?: string;
}
