"use client";

import React from "react";
import { type Project } from "../../../store/projects.types";
import { DocsScreen } from "@/domains/docs/components/docs-screen";

interface DocumentsTabProps {
  project: Project;
  organizationId: string;
}

export function DocumentsTab({ project, organizationId }: DocumentsTabProps) {
  return <DocsScreen projectId={project.id} />;
}
