export type ProjectStatus = "planned" | "active" | "paused" | "completed" | "archived";
export type ProjectHealth = "onTrack" | "atRisk" | "blocked";
export type Visibility = "private" | "team" | "workspace";

export interface Project {
  id: string;
  name: string;
  reference?: string;
  clientId?: string;
  opportunityId?: string;
  status: ProjectStatus;
  health: ProjectHealth;
  visibility?: Visibility;
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  templateId?: string;
  _creationTime: number;
  syncState?: "draft" | "blocked" | "synced";
}
