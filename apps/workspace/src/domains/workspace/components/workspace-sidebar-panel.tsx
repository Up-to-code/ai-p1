"use client";

import type { ReactNode } from "react";
import {
  AtSign,
  Bell,
  CalendarDays,
  Hash,
  Inbox,
  ListTodo,
  MessageSquare,
  Newspaper,
  PenLine,
  Plus,
  Send,
  UserCircle,
} from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { SidebarPanelLink } from "@/components/layout/sidebar/components/sidebar-panel-link";
import { SidebarPanelLayout } from "@/components/layout/sidebar/components/sidebar-panel-layout";
import { WorkspaceLink } from "@/components/layout/workspace-link";

const mainItems = [
  { href: "/ws/inbox", icon: Inbox, label: "Inbox" },
  { href: "/ws/replies", icon: MessageSquare, label: "Replies" },
  { href: "/ws/activity", icon: AtSign, label: "Chat Activity" },
  { href: "/ws/posts", icon: Newspaper, label: "Posts" },
  { href: "/ws/channels", icon: Hash, label: "All Channels" },
  { href: "/ws/spaces", icon: PenLine, label: "All Spaces" },
  { href: "/ws", icon: ListTodo, label: "All Tasks" },
  { href: "/tasks", icon: UserCircle, label: "My Tasks" },
];

const myTaskItems = [
  { href: "/tasks", icon: Bell, label: "Assigned to me" },
  { href: "/tasks", icon: CalendarDays, label: "Today & Overdue" },
  { href: "/tasks", icon: ListTodo, label: "Personal List" },
];

const channels = ["Space", "General", "List", "fack", "Welcome"];

export function WorkspaceSidebarPanel() {
  const session = useAuthSession();
  const orgName =
    session.organization.legalName?.trim() ||
    session.organization.name ||
    "Workspace";

  return (
    <SidebarPanelLayout
      title="Home"
      navbarActions={null}
      footer={null}
    >
      <div className="space-y-4">
        <SidebarSection>
          {mainItems.map((item) => (
            <SidebarPanelLink key={item.href + item.label} {...item} />
          ))}
          <div className="pl-4">
            {myTaskItems.map((item) => (
              <SidebarPanelLink key={item.label} {...item} />
            ))}
          </div>
        </SidebarSection>

        <SidebarSection title="AI Chats">
          <SidebarPanelLink
            href="/ai"
            icon={MessageSquare}
            label="Bulk Task Creation"
          />
          <button
            type="button"
            className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Ask, Build, Create
          </button>
        </SidebarSection>

        <SidebarSection title="Channels">
          {channels.map((channel) => (
            <WorkspaceLink
              key={channel}
              href="/ws/inbox"
              className="flex h-7 items-center gap-2 rounded-md px-2 text-[12px] text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
            >
              <Hash className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {channel}
                {channel === "General" ? ` - ${orgName}` : ""}
              </span>
            </WorkspaceLink>
          ))}
          <button
            type="button"
            className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Channel
          </button>
        </SidebarSection>

        <SidebarSection title="Direct Messages">
          <SidebarPanelLink
            href="/ws/inbox"
            icon={UserCircle}
            label={`${session.user.name} - You`}
          />
          <button
            type="button"
            className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New message
          </button>
        </SidebarSection>

        <SidebarSection title="Spaces">
          <SidebarPanelLink href="/ws" icon={ListTodo} label={`All Tasks - ${orgName}`} />
          <SidebarPanelLink href="/ws/spaces" icon={Send} label="Space" />
          <button
            type="button"
            className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Space
          </button>
        </SidebarSection>
      </div>
    </SidebarPanelLayout>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className={title ? "border-t border-border pt-3" : ""}>
      {title ? (
        <div className="mb-1 px-2 text-[11px] font-medium text-muted-foreground">
          {title}
        </div>
      ) : null}
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}
