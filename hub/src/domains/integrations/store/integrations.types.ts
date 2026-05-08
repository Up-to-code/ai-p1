export type IntegrationStatus = "synced" | "approved" | "pending" | "draft" | "blocked";

export interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: IntegrationStatus;
  volume: string;
  iconName: "store" | "database" | "arrows" | "globe" | "mobile" | "code";
}
