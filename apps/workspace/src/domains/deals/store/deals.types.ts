import type { DealStage, DealStatus, DealPriority, DealRecord } from "@qentrah/domain-contracts";
export type { DealStage, DealStatus, DealPriority, DealRecord as Deal } from "@qentrah/domain-contracts";

export type DealStats = {
  total: number;
  open: number;
  qualified: number;
  won: number;
  lost: number;
  totalValue: number;
};

export type DealFormValues = {
  title: string;
  stage: DealStage;
  status: DealStatus;
  priority: DealPriority;
  value: string;
  currency: string;
  dealThinking: string;
  clientId: string;
  projectId: string;
  source: string;
  closeDate: string;
  nextStep: string;
  tags: string;
};
