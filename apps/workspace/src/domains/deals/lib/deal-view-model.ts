import type { Deal, DealFormValues, DealPriority, DealStage, DealStats } from "../store/deals.types";
import { DEAL_STAGES } from "../config/deals.config";

export const dealStages = DEAL_STAGES;
export const activeDealStages: DealStage[] = ["lead", "qualified", "proposal_sent", "contract_sent"];
export const dealViews = ["pipeline", "list"] as const;

export function stageTone(stage: DealStage) {
  if (stage === "won") return "success" as const;
  if (stage === "lost") return "danger" as const;
  if (stage === "proposal_sent" || stage === "contract_sent") return "info" as const;
  return "neutral" as const;
}

export function priorityTone(priority: DealPriority) {
  if (priority === "urgent") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "neutral" as const;
}

export function formatValue(deal: Deal) {
  if (!deal.value) return "No value";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: deal.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(deal.value);
}

export function formatTotalValue(stats: DealStats) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(stats.totalValue);
}

export function formFromDeal(deal: Deal): DealFormValues {
  return {
    title: deal.title,
    stage: deal.stage,
    status: deal.status,
    priority: deal.priority,
    value: deal.value ? String(deal.value) : "",
    currency: deal.currency ?? "USD",
    dealThinking: deal.dealThinking ?? "",
    source: deal.source ?? "",
    closeDate: deal.closeDate ?? "",
    nextStep: deal.nextStep ?? "",
    clientId: deal.clientId ?? "",
    projectId: deal.projectId ?? "",
    tags: (deal.tags ?? []).join(", "),
  };
}

export function dealValuesForStage(deal: Deal, stage: DealStage): Partial<Deal> {
  const patch: Partial<Deal> = { stage };
  if (stage === "won") patch.status = "won";
  else if (stage === "lost") patch.status = "lost";
  else patch.status = "open";
  return patch;
}

export function matchesDealSearch(deal: Deal, search: string) {
  const q = search.toLowerCase();
  return (
    deal.title.toLowerCase().includes(q) ||
    deal.source?.toLowerCase().includes(q) ||
    deal.nextStep?.toLowerCase().includes(q) ||
    deal.dealThinking?.toLowerCase().includes(q) ||
    (deal.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
  );
}
