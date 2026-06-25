import type { OpportunityFormValues, OpportunityPriority, OpportunityStage, OpportunityStatus } from "../opportunities.types";

export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export const OPPORTUNITY_STATUSES: OpportunityStatus[] = ["open", "paused", "won", "lost"];

export const OPPORTUNITY_PRIORITIES: OpportunityPriority[] = ["low", "normal", "high", "urgent"];

export const EMPTY_OPPORTUNITY_FORM: OpportunityFormValues = {
  title: "",
  stage: "new",
  status: "open",
  priority: "normal",
  value: "",
  currency: "USD",
  source: "",
  closeDate: "",
  nextStep: "",
  clientId: "",
  projectId: "",
  tags: "",
};
