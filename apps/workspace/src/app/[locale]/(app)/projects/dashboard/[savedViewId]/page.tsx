import { ProjectDashboardView } from "@/domains/projects/components/views/project-dashboard-view";
export default async function Page({ params }: { params: Promise<{ savedViewId: string }> }) { const { savedViewId } = await params; return <ProjectDashboardView savedViewId={savedViewId} />; }
