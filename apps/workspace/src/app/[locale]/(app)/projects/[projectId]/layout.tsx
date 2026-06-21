import { use } from "react";
import { ProjectDetailLayout } from "@/domains/projects/components/detail/project-detail-layout";

export default function ProjectLayout({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return <ProjectDetailLayout projectId={projectId} />;
}
