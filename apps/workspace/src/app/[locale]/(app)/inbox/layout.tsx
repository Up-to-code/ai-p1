import type { ReactNode } from "react";
import { InboxWorkspaceShell } from "@/domains/inbox/components/inbox-workspace-shell";

export default function InboxLayout({ children }: { children: ReactNode }) {
  return <InboxWorkspaceShell>{children}</InboxWorkspaceShell>;
}
