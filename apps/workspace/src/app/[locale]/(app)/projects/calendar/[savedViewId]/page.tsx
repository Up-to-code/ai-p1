import { ProjectCalendarView } from "@/domains/projects/components/views/project-calendar-view";
export default async function Page({ params }: { params: Promise<{ savedViewId: string }> }) { const { savedViewId } = await params; return <ProjectCalendarView savedViewId={savedViewId} />; }
