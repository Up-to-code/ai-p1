"use client";

import { ProjectForm, type ProjectFormProps } from "./project-form";
import type { Project } from "../store/projects.types";

export interface EditProjectFormProps {
  project: Project;
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditProjectForm({ project, ...rest }: EditProjectFormProps) {
  return <ProjectForm existing={project} {...rest} />;
}
