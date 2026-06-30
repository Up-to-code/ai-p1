"use client";

import { useState, useCallback } from "react";
import { useAccountContext } from "@/domains/auth";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useProjectsIndexQuery } from "../api/projects";
import { useTranslations } from "next-intl";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { AppPageShell, AddMenu } from "@/components/shared";
import { FolderKanban, LayoutGrid, Wand2, ArrowLeft } from "lucide-react";
import { CreateProjectForm } from "./create-project-form";
import { ProjectsOverviewDashboard } from "./projects-overview-dashboard";
import { useNavigation } from "@/domains/navigation";

export function SpaceDetailView({ spaceSlug }: { spaceSlug: string }) {
  const account = useAccountContext();
  const { clearContext } = useNavigation();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isAutoLayout, setIsAutoLayout] = useState(false);
  const t = useTranslations("Projects");

  const spaces = useWorkspaceSpacesQuery(orgId);
  const currentSpace = spaces?.find((s) => s.slug === spaceSlug);

  const query = useProjectsIndexQuery(orgId);
  const projects = query.results ?? [];

  const addActions = (
    <AddMenu
      triggerLabel={t("add")}
      items={[
        { label: `${t("add")} Project`, icon: <FolderKanban className="h-4 w-4 text-primary" />, onClick: () => setIsCreateModalOpen(true) },
        { label: "Add Widget", icon: <LayoutGrid className="h-4 w-4 text-indigo-500" />, onClick: () => setIsWidgetModalOpen(true) },
        { label: "Auto Layout", icon: <Wand2 className="h-4 w-4 text-amber-500" />, onClick: () => setIsAutoLayout(true) },
      ]}
    />
  )

  return (
    <AppPageShell>
      <div className="flex items-center gap-3">
        {currentSpace?.color && (
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: currentSpace.color }}
          />
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            {currentSpace?.name ?? spaceSlug}
          </h1>
          <p className="text-xs text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {addActions}
      </div>

      <div className="flex-1 min-h-0">
        <ProjectsOverviewDashboard
          isWidgetModalOpen={isWidgetModalOpen}
          onWidgetModalClose={() => setIsWidgetModalOpen(false)}
          isAutoLayout={isAutoLayout}
          onAutoLayoutComplete={() => setIsAutoLayout(false)}
        />
      </div>

      <CreateProjectForm
        isOpen={isCreateModalOpen}
        onSuccess={() => setIsCreateModalOpen(false)}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        isDeleting={false}
        onConfirm={() => setDeleting(null)}
      />
    </AppPageShell>
  );
}
