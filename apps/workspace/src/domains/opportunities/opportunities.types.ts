export type OpportunityStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type OpportunityStatus = "open" | "won" | "lost" | "paused";
export type OpportunityPriority = "low" | "normal" | "high" | "urgent";

export type Opportunity = {
  id: string;
  title: string;
  stage: OpportunityStage;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  value?: number;
  currency?: string;
  source?: string;
  closeDate?: string;
  nextStep?: string;
  clientId?: string;
  projectId?: string;
  ownerUserId: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
};

export type OpportunityStats = {
  total: number;
  open: number;
  qualified: number;
  won: number;
  lost: number;
  value: number;
};

export type OpportunityFormValues = {
  title: string;
  stage: OpportunityStage;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  value: string;
  currency: string;
  source: string;
  closeDate: string;
  nextStep: string;
  clientId: string;
  projectId: string;
  tags: string;
};

