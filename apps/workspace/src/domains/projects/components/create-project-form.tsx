"use client";

import { ProjectForm, type ProjectFormProps } from "./project-form";

export type CreateProjectFormProps = Omit<ProjectFormProps, "existing">;

export function CreateProjectForm(props: CreateProjectFormProps) {
  return <ProjectForm {...props} />;
}
