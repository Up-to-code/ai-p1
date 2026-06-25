export type PipelineType = "opportunity" | "deal";

export type PipelineStage<T extends PipelineType> = T extends "opportunity"
  ? "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost"
  : "lead" | "qualified" | "proposal_sent" | "contract_sent" | "won" | "lost";

export type PipelineStatus = "open" | "won" | "lost" | "paused";
export type PipelinePriority = "low" | "normal" | "high" | "urgent";

export type PipelineRecord<T extends PipelineType = PipelineType> = {
  id: string;
  title: string;
  stage: PipelineStage<T>;
  status: PipelineStatus;
  priority: PipelinePriority;
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
} & (T extends "deal" ? { dealThinking?: string } : {});

export type PipelineStats<T extends PipelineType = PipelineType> = {
  total: number;
  open: number;
  qualified: number;
  won: number;
  lost: number;
} & (T extends "deal" ? { totalValue: number } : { value: number });

export type PipelineFormValues<T extends PipelineType = PipelineType> = {
  title: string;
  stage: PipelineStage<T>;
  status: PipelineStatus;
  priority: PipelinePriority;
  value: string;
  currency: string;
  source: string;
  closeDate: string;
  nextStep: string;
  clientId: string;
  projectId: string;
  tags: string;
} & (T extends "deal" ? { dealThinking: string } : {});

export function pipelinePayloadFromForm<T extends PipelineType>(
  values: PipelineFormValues<T>,
): Record<string, unknown> {
  const trimmed = values.value.trim();
  const number = trimmed ? Number(trimmed) : undefined;
  const parsedValue = Number.isFinite(number) ? number : undefined;

  const base = {
    title: values.title,
    stage: values.stage,
    status: values.status,
    priority: values.priority,
    value: parsedValue,
    currency: values.currency || "USD",
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    clientId: values.clientId || undefined,
    projectId: values.projectId || undefined,
    source: values.source || undefined,
    closeDate: values.closeDate || undefined,
    nextStep: values.nextStep || undefined,
  };

  if ("dealThinking" in values) {
    return { ...base, dealThinking: (values as PipelineFormValues<"deal">).dealThinking || undefined };
  }

  return base;
}
