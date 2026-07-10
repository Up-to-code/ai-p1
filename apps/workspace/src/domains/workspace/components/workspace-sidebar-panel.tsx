"use client";

import type { ReactNode } from "react";
import {
  Inbox,
  FolderKanban,
  Hash,
  ListTodo,
  Layers,
} from "lucide-react";
import { SidebarPanelLink } from "@/components/layout/sidebar/components/sidebar-panel-link";
import { SidebarPanelLayout } from "@/components/layout/sidebar/components/sidebar-panel-layout";

const mainItems = [
  { href: "/ws/inbox", icon: Inbox, label: "Inbox" },
  { href: "/ws/channels", icon: Hash, label: "All Channels" },
  { href: "/ws/spaces", icon: Layers, label: "All Spaces" },
  { href: "/tasks", icon: ListTodo, label: "My Tasks" },
];

const workspaceItems = [
  { href: "/ws", icon: ListTodo, label: "All Tasks" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
];

export function WorkspaceSidebarPanel() {
  return (
    <SidebarPanelLayout title="Home" navbarActions={null} footer={null}>
      <div className="space-y-4">
        <SidebarSection>
          {mainItems.map((item) => (
            <SidebarPanelLink key={item.href + item.label} {...item} />
          ))}
        </SidebarSection>

        <SidebarSection title="Workspace">
          {workspaceItems.map((item) => (
            <SidebarPanelLink key={item.href} {...item} />
          ))}
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
