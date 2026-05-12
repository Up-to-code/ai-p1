import { ProjectFormScreen } from "@/domains/projects";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectFormScreen id={id} />;
}
