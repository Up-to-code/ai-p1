import type {
  Opportunity,
  OpportunityFormValues,
  OpportunityPriority,
  OpportunityStage,
} from "../opportunities.types";
import { OPPORTUNITY_STAGES } from "../config/opportunities.config";

export const opportunityStages = OPPORTUNITY_STAGES;

export function stageTone(stage: OpportunityStage) {
  if (stage === "won") return "success" as const;
  if (stage === "lost") return "danger" as const;
  if (stage === "proposal" || stage === "negotiation") return "info" as const;
  return "neutral" as const;
}

export function priorityTone(priority: OpportunityPriority) {
  if (priority === "urgent") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "neutral" as const;
}

export function formatValue(opportunity: Opportunity) {
  if (!opportunity.value) return "No value";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: opportunity.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(opportunity.value);
}

export function formFromOpportunity(opportunity: Opportunity): OpportunityFormValues {
  return {
    title: opportunity.title,
    stage: opportunity.stage,
    status: opportunity.status,
    priority: opportunity.priority,
    value: opportunity.value ? String(opportunity.value) : "",
    currency: opportunity.currency ?? "USD",
    source: opportunity.source ?? "",
    closeDate: opportunity.closeDate ?? "",
    nextStep: opportunity.nextStep ?? "",
    clientId: opportunity.clientId ?? "",
    projectId: opportunity.projectId ?? "",
    tags: (opportunity.tags ?? []).join(", "),
  };
}

export function opportunityValuesForStage(
  opportunity: Opportunity,
  stage: OpportunityStage,
): OpportunityFormValues {
  const values = formFromOpportunity(opportunity);
  values.stage = stage;
  if (stage === "won") values.status = "won";
  else if (stage === "lost") values.status = "lost";
  else if (values.status === "won" || values.status === "lost") values.status = "open";
  return values;
}

export function matchesOpportunitySearch(opportunity: Opportunity, search: string) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [opportunity.title, opportunity.nextStep, opportunity.source, ...(opportunity.tags ?? [])].some(
    (value) => value?.toLowerCase().includes(needle),
  );
}
