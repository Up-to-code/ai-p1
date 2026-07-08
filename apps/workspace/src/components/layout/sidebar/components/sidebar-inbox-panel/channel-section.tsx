"use client";

import { type ElementType } from "react";
import { ChevronDown, ChevronRight, Hash, Settings } from "lucide-react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLink } from "../sidebar-panel-link";
import type { SidebarInboxChannel } from "./types";

type ChannelSectionProps = {
  title: string;
  icon: ElementType;
  channels: SidebarInboxChannel[];
  collapsed: boolean;
  onToggle: () => void;
};

export function ChannelSection({
  title,
  icon: Icon,
  channels,
  collapsed,
  onToggle,
}: ChannelSectionProps) {
  if (channels.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-7 w-full items-center gap-1.5 rounded-md px-1.5 text-left transition-colors hover:bg-accent"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
        )}
        <Icon className="h-3 w-3 text-muted-foreground/60" />
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-0.5 space-y-0.5 pl-1">
          {channels.map((channel) => (
            <SidebarPanelLink
              key={channel.id}
              href="/inbox"
              icon={Hash}
              label={channel.name}
              paramKey="channel"
              paramValue={channel.id}
              clearParams={["new", "settings"]}
              iconPicker={() => (
                <div className="w-44 p-1">
                  <WorkspaceLink
                    href="/inbox"
                    extraParams={{
                      channel: channel.id,
                      settings: channel.id,
                      new: "",
                    }}
                    className="flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    Channel settings
                  </WorkspaceLink>
                </div>
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
