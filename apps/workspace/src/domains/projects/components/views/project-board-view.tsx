"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { PipelineBoard } from "@/components/shared/view-system";
import type { CardItem, StageDefinition } from "@/components/shared/view-system";
import { useToast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
import { updateProjectRequest } from "../../api/projects";
import { useProjectCollectionView } from "../../hooks/use-project-collection-view";
import type { Project, ProjectStatus } from "../../store/projects.types";
import { ProjectViewEmpty, ProjectViewError, ProjectViewLoading } from "./project-view-states";

const STAGES: StageDefinition[] = [
  { key: "planned", name: "Planned", color: "var(--muted-foreground)" },
  { key: "active", name: "Active", color: "var(--primary)" },
  { key: "paused", name: "Paused", color: "var(--chart-4)" },
  { key: "completed", name: "Completed", color: "var(--chart-2)" },
  { key: "archived", name: "Archived", color: "var(--chart-3)" },
];

function projectUpdateValues(project: Project, status: ProjectStatus) {
  return {
    name: project.name,
    clientId: project.clientId ?? "",
    opportunityId: project.opportunityId ?? "",
    status,
    health: project.health,
    visibility: project.visibility ?? "space_members" as const,
    startDate: project.startDate ?? "",
    endDate: project.endDate ?? "",
    budget: project.budget == null ? "" : String(project.budget),
    description: project.description ?? "",
    tags: project.tags ?? [],
    templateId: project.templateId ?? "",
    useAiSetup: false,
    progress: project.progress,
    teamMemberIds: project.teamMemberIds,
  };
}

export function ProjectBoardView({ savedViewId }: { savedViewId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const view = useProjectCollectionView("board", savedViewId);
  if (view.queryStatus === "loading" || view.queryStatus === "idle") return <ProjectViewLoading />;
  if (view.queryStatus === "error") return <ProjectViewError message={view.errorMessage} />;
  if (view.projects.length === 0) return <ProjectViewEmpty />;
  const items: CardItem[] = view.projects.map((project) => ({ id: project.id, stageKey: project.status, title: project.name, badge: project.health, avatarFallback: project.name.slice(0, 2).toUpperCase(), meta: [{ label: "Progress", value: `${project.progress ?? 0}%` }, { label: "End", value: project.endDate ? new Date(project.endDate).toLocaleDateString() : "Unscheduled" }], data: { project } }));
  async function moveProject(itemId: string, status: string) {
    const project = view.projects.find((candidate) => candidate.id === itemId);
    if (!project || !view.organizationId) return;
    try {
      await updateProjectRequest(view.organizationId, itemId, projectUpdateValues(project, status as ProjectStatus));
      await queryClient.invalidateQueries({ queryKey: ["projects-index", view.organizationId] });
    } catch (error) {
      logger.error("project_board.status_update_failed", { error, projectId: itemId, status });
      toast({ title: "Project status could not be updated", type: "error" });
    }
  }
  return <PipelineBoard items={items} stages={STAGES} draggable onCardMove={(id, _from, to) => void moveProject(id, to)} onCardClick={(item) => router.push(`/projects/${item.id}`)} />;
}
