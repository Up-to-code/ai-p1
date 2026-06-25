import type { PipelineStage } from "@/domains/clients/store/clients.types";
import type { StageDefinition, CardItem } from "@/components/shared/view-system/types";
import type { PipelineStage as DBPipelineStage } from "@/domains/clients/api/pipeline-stages";

export function stagesToDefinitions(stages: DBPipelineStage[]): StageDefinition[] {
  return stages.map((s) => ({
    key: s.key,
    name: s.name,
    color: s.color,
    order: s.order,
  }));
}

export function clientToCardItem(client: {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  company?: string;
  source?: string;
  pipelineStage: PipelineStage;
  type: string;
}): CardItem {
  return {
    id: client.id,
    stageKey: client.pipelineStage,
    title: client.name,
    subtitle: client.contact,
    badge: undefined,
    badgeColor: undefined,
    meta: client.source
      ? [{ label: "Source", value: client.source }]
      : undefined,
    data: client as unknown as Record<string, unknown>,
  };
}
