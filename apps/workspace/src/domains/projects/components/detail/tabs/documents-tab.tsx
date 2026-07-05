"use client";

import React from "react";
import { type Project } from "../../../store/projects.types";
import { DocsPageRedesigned } from "@/domains/docs/components/DocsPageRedesigned";

interface DocumentsTabProps {
  project: Project;
  organizationId: string;
}

export function DocumentsTab({ project, organizationId }: DocumentsTabProps) {
  return <DocsPageRedesigned projectId={project.id} />;
}
