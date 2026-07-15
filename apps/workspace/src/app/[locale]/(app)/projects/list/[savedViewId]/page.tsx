import { ProjectListCollectionView } from "@/domains/projects/components/views/project-list-collection-view";
export default async function Page({ params }: { params: Promise<{ savedViewId: string }> }) { const { savedViewId } = await params; return <ProjectListCollectionView savedViewId={savedViewId} />; }
