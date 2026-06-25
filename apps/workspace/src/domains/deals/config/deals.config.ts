import type { DealFormValues, DealPriority, DealStage } from "../store/deals.types";

export const DEAL_STAGES: DealStage[] = [
  "lead",
  "qualified",
  "proposal_sent",
  "contract_sent",
  "won",
  "lost",
];

export const DEAL_STATUSES = ["open", "paused", "won", "lost"] as const;

export const DEAL_PRIORITIES: DealPriority[] = ["low", "normal", "high", "urgent"];

export const EMPTY_DEAL_FORM: DealFormValues = {
  title: "",
  stage: "lead",
  status: "open",
  priority: "normal",
  value: "",
  currency: "USD",
  dealThinking: "",
  source: "",
  closeDate: "",
  nextStep: "",
  clientId: "",
  projectId: "",
  tags: "",
};
