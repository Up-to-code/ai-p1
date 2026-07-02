"use client";

import React from "react";
import { useRouter } from "@/i18n/routing";
import { type Project } from "../../store/projects.types";
import { type ProjectFormValues } from "../../validation/project.schema";
import { EntityDetailHeader, type EntityDetailHeaderAction, type EntityDetailHeaderField } from "@/components/shared/entity-detail-header";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { useState } from "react";
import { useAccountContext } from "@/domains/auth";
import { deleteProjectRequest } from "../../api/projects";
import { useOptimisticInvalidation } from "@/domains/cache/hooks/use-optimistic-invalidation";
import { Pencil, Trash2 } from "lucide-react";
import { logger } from "@/lib/logger";

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
  const { invalidate } = useOptimisticInvalidation();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!orgId) return;
    try {
      await deleteProjectRequest(orgId, project.id);
      await invalidate({ type: "list", resource: "projects" });
      router.push("/projects");
    } catch (err) {
      logger.error("project.delete_failed", { error: err });
    }
    setIsDeleting(false);
  };

  const fields: EntityDetailHeaderField[] = [
    {
      type: "tags",
      value: project.tags || [],
      onChange: (tags) => onUpdate({ tags }),
      availableTags: ["Urgent", "Internal", "Client-facing", "Phase 1", "Phase 2"],
    },
    {
      type: "select",
      value: project.status,
      onChange: (status) => onUpdate({ status }),
      options: statusOptions,
      colorMapType: "project-status",
      defaultColors: defaultStatusColors,
    },
    {
      type: "select",
      value: project.health,
      onChange: (health) => onUpdate({ health }),
      options: healthOptions,
      colorMapType: "project-health",
      defaultColors: defaultHealthColors,
    },
  ];

  const actions: EntityDetailHeaderAction[] = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => router.push(`/projects/${project.id}/edit`),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => setIsDeleting(true),
      destructive: true,
    },
  ];

  return (
    <>
      <EntityDetailHeader
        name={project.name}
        title={project.name}
        onTitleChange={(name) => onUpdate({ name })}
        fields={fields}
        actions={actions}
      />
      <DeleteRecordDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        isDeleting={false}
        onConfirm={handleDelete}
      />
    </>
  );
}
