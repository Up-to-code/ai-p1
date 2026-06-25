import { TaskDetailScreen } from "@/domains/tasks/components/task-detail-screen";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetailScreen id={id} />;
}

