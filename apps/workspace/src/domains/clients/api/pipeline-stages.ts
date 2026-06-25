import { useQuery as useConvexQuery, useMutation } from "convex/react";
import { api as convexApi } from "@convex/_generated/api";
import { useMemo, useRef } from "react";

export interface PipelineStage {
  _id: string;
  organizationId: string;
  key: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export function usePipelineStages(organizationId: string | undefined) {
  const stages = useConvexQuery(
    convexApi.pipeline_stages.read.list,
    organizationId ? { organizationId } : "skip"
  );
  const seedDefaults = useMutation(convexApi.pipeline_stages.write.seedDefaults);
  const hasSeededRef = useRef<string | null>(null);

  const seeded = useMemo(() => {
    if (!organizationId) return false;
    if (stages === undefined) return false;
    if (stages.length > 0) return false;
    if (hasSeededRef.current === organizationId) return false;
    hasSeededRef.current = organizationId;
    seedDefaults({ organizationId });
    return true;
  }, [organizationId, stages]);

  return {
    stages: (stages ?? []) as PipelineStage[],
    activeStages: (stages ?? []).filter((s: PipelineStage) => s.isActive).sort((a: PipelineStage, b: PipelineStage) => a.order - b.order),
    isLoading: stages === undefined,
    isSeeding: seeded,
  };
}

export function useCreatePipelineStage() {
  return useMutation(convexApi.pipeline_stages.write.create);
}

export function useUpdatePipelineStage() {
  return useMutation(convexApi.pipeline_stages.write.update);
}

export function useDeletePipelineStage() {
  return useMutation(convexApi.pipeline_stages.write.remove);
}

export function useReorderPipelineStages() {
  return useMutation(convexApi.pipeline_stages.write.reorder);
}

export function useSeedDefaultPipelineStages() {
  return useMutation(convexApi.pipeline_stages.write.seedDefaults);
}

export function getStageColor(stages: PipelineStage[], key: string): string {
  return stages.find((s) => s.key === key)?.color ?? "#9CA3AF";
}

export function getStageName(stages: PipelineStage[], key: string): string {
  return stages.find((s) => s.key === key)?.name ?? key;
}
