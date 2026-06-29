"use client";

import { useState, useCallback } from "react";
import { useAccountContext } from "@/domains/auth";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useProjectsIndexQuery } from "../api/projects";
import { useTranslations } from "next-intl";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              {currentSpace?.color && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: currentSpace.color }}
                />
              )}
              <h1 className="text-lg font-bold text-foreground">
                {currentSpace?.name ?? spaceSlug}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="h-9 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm">
              {t("add")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border bg-card shadow-xl p-1.5">
            <DropdownMenuItem
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer"
            >
              <FolderKanban className="h-4 w-4 text-primary" />
              {t("add")} Project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsWidgetModalOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer"
            >
              <LayoutGrid className="h-4 w-4 text-indigo-500" />
              Add Widget
            </DropdownMenuItem>
            <div className="my-1 h-px bg-border" />
            <DropdownMenuItem
              onClick={() => setIsAutoLayout(true)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer"
            >
              <Wand2 className="h-4 w-4 text-amber-500" />
              Auto Layout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Widget Dashboard */}
      <div className="flex-1 min-h-0">
        <ProjectsOverviewDashboard
          isWidgetModalOpen={isWidgetModalOpen}
          onWidgetModalClose={() => setIsWidgetModalOpen(false)}
          isAutoLayout={isAutoLayout}
          onAutoLayoutComplete={() => setIsAutoLayout(false)}
        />
      </div>

      {/* Create Modal */}
      <CreateProjectForm
        isOpen={isCreateModalOpen}
        onSuccess={() => setIsCreateModalOpen(false)}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      {/* Delete Dialog */}
      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        isDeleting={false}
        onConfirm={() => setDeleting(null)}
      />
    </div>
  );
}
