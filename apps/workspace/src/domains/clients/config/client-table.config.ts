export const CLIENT_TABLE_PAGE_SIZE = 15;

export type ClientTableSortField =
  | "name"
  | "type"
  | "status"
  | "pipelineStage"
  | "lastContact";

export type ClientTableSortDir = "asc" | "desc";

export type ClientTableFilterType = "" | "person" | "organization";
export type ClientTableFilterStatus =
  | ""
  | "new"
  | "active"
  | "nurture"
  | "inactive"
  | "archived";
export type ClientTableFilterStage =
  | ""
  | "new"
  | "qualified"
  | "review"
  | "negotiation"
  | "closed";

export const clientTableStageOptions = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "review", label: "Review" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed", label: "Closed" },
] as const;

export const clientTableTypeOptions = [
  { value: "person", label: "Person" },
  { value: "organization", label: "Organization" },
] as const;

export const clientTableStatusOptions = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "nurture", label: "Nurture" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
] as const;
