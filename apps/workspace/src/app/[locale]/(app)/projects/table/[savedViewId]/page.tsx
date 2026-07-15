import { ProjectTableView } from "@/domains/projects/components/views/project-table-view";
export default async function Page({ params }: { params: Promise<{ savedViewId: string }> }) { const { savedViewId } = await params; return <ProjectTableView savedViewId={savedViewId} />; }
