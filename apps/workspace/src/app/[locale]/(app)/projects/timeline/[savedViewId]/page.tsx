import { ProjectTimelineView } from "@/domains/projects/components/views/project-timeline-view";
export default async function Page({ params }: { params: Promise<{ savedViewId: string }> }) { const { savedViewId } = await params; return <ProjectTimelineView savedViewId={savedViewId} />; }
