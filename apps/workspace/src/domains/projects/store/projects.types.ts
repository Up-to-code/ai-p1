import type { ProjectStatus, ProjectHealth, ProjectVisibility } from "@qentrah/domain-contracts";
export type { ProjectStatus, ProjectHealth, ProjectVisibility } from "@qentrah/domain-contracts";

export type Project = {
  id: string;
  name: string;
  reference?: string;
  clientId?: string;
  opportunityId?: string;
  status: ProjectStatus;
  health: ProjectHealth;
  visibility?: ProjectVisibility;
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  templateId?: string;
  tags?: string[];
  progress?: number;
  teamMemberIds?: string[];
  customTabs?: string[];
  _creationTime: number;
  syncState?: "draft" | "blocked" | "synced";
  dataVersion?: number;
};
