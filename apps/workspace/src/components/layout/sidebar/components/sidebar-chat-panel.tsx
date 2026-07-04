"use client";

import { MessageSquareText, SendHorizonal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";

export function SidebarChatPanel() {
  const t = useTranslations("Sidebar");

  return (
    <SidebarPanelLayout title="AI Chat">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <MessageSquareText className="mb-2 h-8 w-8 text-text-muted/30" strokeWidth={1.5} />
          <p className="text-xs font-medium text-text-muted mb-4">
            Open the AI chat to start a conversation
          </p>
          <WorkspaceLink
            href={workspaceModeHref("ai")}
            className="flex items-center gap-2 rounded-lg bg-[var(--q-user-bubble)] px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            <SendHorizonal className="h-3.5 w-3.5" />
            Open AI Chat
          </WorkspaceLink>
        </div>
      </div>
    </SidebarPanelLayout>
  );
}
