export type DealStage = "lead" | "qualified" | "proposal_sent" | "contract_sent" | "won" | "lost";
export type DealStatus = "open" | "won" | "lost" | "paused";
export type DealPriority = "low" | "normal" | "high" | "urgent";

export type Deal = {
  id: string;
  title: string;
  stage: DealStage;
  status: DealStatus;
  priority: DealPriority;
  value?: number;
  currency?: string;
  dealThinking?: string;
  clientId?: string;
  projectId?: string;
  source?: string;
  closeDate?: string;
  nextStep?: string;
  ownerUserId: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
};

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
