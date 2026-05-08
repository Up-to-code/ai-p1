import { ProjectDetailScreen } from "@/domains/projects";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailScreen id={id} />;
}
