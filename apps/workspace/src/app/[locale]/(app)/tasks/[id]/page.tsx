import { TaskDetailScreen } from "@/domains/tasks/components/tasks-screen";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetailScreen id={id} />;
}

