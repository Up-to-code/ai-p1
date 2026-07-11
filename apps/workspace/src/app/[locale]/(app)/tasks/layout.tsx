import type { ReactNode } from "react";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden bg-background px-6">
      {children}
    </div>
  );
}
