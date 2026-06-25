export const pipelineStages = ["new", "qualified", "review", "negotiation", "closed"] as const;
export const activePipelineStages = ["new", "qualified", "review", "negotiation"] as const;
export const clientFilters = ["all", "person", "organization"] as const;
export const clientViews = ["pipeline", "list", "calendar"] as const;
export const clientStageFilters = ["all", "active", "closed"] as const;
export const clientTypes = ["person", "organization"] as const;
export const clientStatuses = ["new", "active", "nurture", "inactive", "archived"] as const;
export const clientPriorities = ["normal", "high", "urgent"] as const;
export const clientAssetLinkStatuses = [
  "interested",
  "shortlisted",
  "review",
  "proposal",
  "rejected",
] as const;

export type PipelineStage = (typeof pipelineStages)[number];
