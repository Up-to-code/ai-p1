"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useOptimisticInvalidation } from "@/domains/cache/hooks/use-optimistic-invalidation";
import { useAccountContext } from "@/domains/auth";
import { useProjectQuery, updateProjectRequest } from "../../api/projects";
import type { Project } from "../../store/projects.types";
import type { ProjectFormValues } from "../../validation/project.schema";
import { useCurrentSpace } from "../../hooks/use-current-space";
import { AppPageShell, AppTabsList } from "@/components/shared";
import { ProgressiveLoadingState, DetailNotFoundState } from "@/components/shared/crud-ui";
import { ProjectDetailHeader } from "./project-detail-header";
import { OverviewTab } from "./tabs/overview-tab";
import { TasksTimelineTab } from "./tabs/tasks-timeline-tab";
import { CalendarTab } from "./tabs/calendar-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { BudgetTab } from "./tabs/budget-tab";
import { TeamTab } from "./tabs/team-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export function ProjectDetailLayout({ projectId }: { projectId: string }) {
  const t = useTranslations("Projects");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const { invalidate } = useOptimisticInvalidation();
  const workspaceStatus = account.workspace.status;
  const workspaceOrganizationId =
    workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  // Resolve space slug from URL to spaceId for scoped data loading
  const currentSpace = useCurrentSpace();
  const currentSpaceId = currentSpace?.spaceId ?? undefined;

  const project = useProjectQuery(workspaceOrganizationId, projectId) as Project | null | undefined;

  if (workspaceStatus !== "ready") {
    return (
      <AppPageShell>
        <div className="p-8">Loading workspace...</div>
      </AppPageShell>
    );
  }

  if (project === undefined) {
    return (
      <AppPageShell>
        <ProgressiveLoadingState
          title="Loading project..."
          description="Fetching project details"
          variant="detail"
        />
      </AppPageShell>
    );
  }

  if (project === null) {
    return (
      <AppPageShell>
        <DetailNotFoundState
          title="Project not found"
          description="The project you're looking for doesn't exist or has been deleted."
          backHref="/projects"
          backLabel="Back to Projects"
        />
      </AppPageShell>
    );
  }

  const handleUpdateProject = async (updatedValues: Partial<ProjectFormValues>) => {
    if (!workspaceOrganizationId) return;
    const formValues: ProjectFormValues = {
      name: project.name,
      clientId: project.clientId ?? "",
      opportunityId: project.opportunityId ?? "",
      status: project.status,
      health: project.health,
      visibility: project.visibility ?? "team",
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
      budget: project.budget != null ? String(project.budget) : "",
      description: project.description ?? "",
      tags: project.tags ?? [],
      templateId: project.templateId ?? "",
      useAiSetup: false,
      ...updatedValues,
    };
    try {
      await updateProjectRequest(workspaceOrganizationId, project.id, formValues);
      await invalidate([
        { type: "detail", resource: "projects", id: projectId },
        { type: "list", resource: "projects" },
      ]);
    } catch (err) {
      console.error("Failed to update project:", err);
    }
  };

  return (
    <AppPageShell contentClassName="space-y-8 pb-16 pt-8 max-w-[1200px] mx-auto px-6">
      <ProjectDetailHeader project={project} onUpdate={handleUpdateProject} />

      <Tabs defaultValue="overview" className="space-y-6">
        <AppTabsList
          className="bg-transparent border-b border-border rounded-none p-0 h-auto justify-start space-x-6"
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "tasks", label: "Tasks & Timeline" },
            { value: "calendar", label: "Calendar" },
            { value: "documents", label: "Files" },
            { value: "budget", label: "Budget" },
            { value: "team", label: "Team" },
            { value: "activity", label: "Activity" },
          ]}
        />

        <TabsContent value="overview" className="mt-6 border-none p-0 outline-none">
          <OverviewTab project={project} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <TasksTimelineTab
              project={project}
              organizationId={workspaceOrganizationId}
              spaceId={currentSpaceId}
            />
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <CalendarTab
              project={project}
              organizationId={workspaceOrganizationId}
              spaceId={currentSpaceId}
            />
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <DocumentsTab project={project} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="budget" className="mt-6 border-none p-0 outline-none">
          <BudgetTab project={project} onUpdate={handleUpdateProject} />
        </TabsContent>

        <TabsContent value="team" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <TeamTab project={project} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <ActivityTab
              project={project}
              organizationId={workspaceOrganizationId}
              spaceId={currentSpaceId}
            />
          )}
        </TabsContent>
      </Tabs>
    </AppPageShell>
  );
}
