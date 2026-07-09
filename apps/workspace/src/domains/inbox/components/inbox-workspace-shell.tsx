"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Hash,
  Inbox,
  MessageSquareReply,
  Newspaper,
  FolderOpen,
} from "lucide-react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { cn } from "@/lib/utils";

const inboxTabs = [
  { href: "/inbox", label: "Primary", icon: Inbox, exact: true },
  { href: "/inbox/replies", label: "Replies", icon: MessageSquareReply },
  { href: "/inbox/activity", label: "Activity", icon: Activity },
  { href: "/inbox/posts", label: "Posts", icon: Newspaper },
  { href: "/inbox/channels", label: "Channels", icon: Hash },
  { href: "/inbox/spaces", label: "Spaces", icon: FolderOpen },
];

export function InboxWorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="shrink-0 border-b border-border/60 bg-background">
        <div className="flex h-12 items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
              <Bell className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold text-foreground">
                Inbox
              </h1>
              <p className="truncate text-[11px] text-muted-foreground">
                Notifications, replies, posts, channels, and spaces
              </p>
            </div>
          </div>
        </div>
        <nav className="flex min-h-10 items-end gap-1 overflow-x-auto px-3">
          {inboxTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.exact
              ? pathname.endsWith("/inbox")
              : pathname.includes(tab.href);

            return (
              <WorkspaceLink
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-[12px] font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </WorkspaceLink>
            );
          })}
        </nav>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
