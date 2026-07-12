import type { ReactNode } from "react";
import { TaskResourceLayout } from "@/domains/tasks/components/task-resource-layout";
import { TaskWorkspaceProvider } from "@/domains/tasks/components/task-workspace-provider";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return (
    <TaskWorkspaceProvider>
      <TaskResourceLayout>{children}</TaskResourceLayout>
    </TaskWorkspaceProvider>
  );
}
