export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  status: "approved" | "pending" | "blocked" | "draft";
  date: string;
}
