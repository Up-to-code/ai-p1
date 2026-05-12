export type WorkspacePersonCardType = "broker" | "client";
export type WorkspacePersonBadge = "verified" | "vip";

export type WorkspaceUnitReference = {
  id: string;
  label: string;
};

export type WorkspaceProjectReference = {
  id: string;
  title: string;
  location: string;
};

export type WorkspacePersonRelation = {
  project: WorkspaceProjectReference | null;
  unit: WorkspaceUnitReference | null;
  stageLabel?: string;
  summary?: string;
};

export type WorkspaceOrganizationMemberRole = "manager" | "member" | "viewer";
export type WorkspaceOrganizationType = "broker" | "red";

export type WorkspaceOrganizationMemberDisplay = {
  id: string;
  authUserId?: string;
  membershipId?: string;
  name: string;
  email: string;
  username?: string;
  role: WorkspaceOrganizationMemberRole;
  statusLabel: string;
};
