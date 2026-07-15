import { ProjectBoardView } from "@/domains/projects/components/views/project-board-view";
export default async function Page({ params }: { params: Promise<{ savedViewId: string }> }) { const { savedViewId } = await params; return <ProjectBoardView savedViewId={savedViewId} />; }
