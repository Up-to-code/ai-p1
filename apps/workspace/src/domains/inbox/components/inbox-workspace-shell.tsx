import type { ReactNode } from "react";

export function InboxWorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
