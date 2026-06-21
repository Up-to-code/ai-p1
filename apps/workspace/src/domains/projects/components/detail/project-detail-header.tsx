"use client";

import React from "react";
import { useRouter } from "@/i18n/routing";
import { type Project } from "../../store/projects.types";
import { type ProjectFormValues } from "../../validation/project.schema";
import { EditableText } from "@/components/ui/editable-text";
import { EditableTags } from "@/components/ui/editable-tags";
import { EditableSelect } from "@/components/ui/editable-select";
import { Button } from "@/components/ui/button";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { useState } from "react";
import { useAccountContext } from "@/domains/auth";
import { deleteProjectRequest } from "../../api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

interface ProjectDetailHeaderProps {
  project: Project;
  onUpdate: (values: Partial<ProjectFormValues>) => void;
}

const statusOptions = [
  { label: "Planned", value: "planned" as const },
  { label: "Active", value: "active" as const },
  { label: "Paused", value: "paused" as const },
  { label: "Completed", value: "completed" as const },
  { label: "Archived", value: "archived" as const },
];

const healthOptions = [
  { label: "On Track", value: "onTrack" as const },
  { label: "At Risk", value: "atRisk" as const },
  { label: "Blocked", value: "blocked" as const },
];

const defaultStatusColors = {
  planned: "gray" as const,
  active: "green" as const,
  paused: "yellow" as const,
  completed: "blue" as const,
  archived: "gray" as const,
};

const defaultHealthColors = {
  onTrack: "green" as const,
  atRisk: "yellow" as const,
  blocked: "red" as const,
};

export function ProjectDetailHeader({ project, onUpdate }: ProjectDetailHeaderProps) {
  const router = useRouter();
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!orgId) return;
    try {
      await deleteProjectRequest(orgId, project.id);
      queryClient.invalidateQueries({ queryKey: ["projects-index", orgId] });
      router.push("/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
    setIsDeleting(false);
  };

  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
      <div className="flex min-w-0 items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-2xl font-black uppercase text-background shadow-sm">
          {project.name.charAt(0)}
        </div>
        <div className="min-w-0 space-y-1.5 mt-1">
          <EditableText
            value={project.name}
            onChange={(name) => onUpdate({ name })}
            as="h1"
            className="max-w-3xl text-3xl font-black leading-tight text-foreground tracking-tight"
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <EditableTags
              tags={project.tags || []}
              onChange={(tags) => onUpdate({ tags })}
              availableTags={["Urgent", "Internal", "Client-facing", "Phase 1", "Phase 2"]}
            />

            <div className="h-4 w-px bg-border shrink-0" />

            <EditableSelect
              value={project.status}
              options={statusOptions}
              onChange={(status) => onUpdate({ status })}
              colorMapType="project-status"
              defaultColors={defaultStatusColors}
            />

            <div className="h-4 w-px bg-border shrink-0" />

            <EditableSelect
              value={project.health}
              options={healthOptions}
              onChange={(health) => onUpdate({ health })}
              colorMapType="project-health"
              defaultColors={defaultHealthColors}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/projects/${project.id}/edit`)}
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit
        </Button>

        <div className="h-4 w-px bg-border mx-1 shrink-0" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => setIsDeleting(true)}
          title="Delete Project"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <DeleteRecordDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        isDeleting={false}
        onConfirm={handleDelete}
      />
    </section>
  );
}
