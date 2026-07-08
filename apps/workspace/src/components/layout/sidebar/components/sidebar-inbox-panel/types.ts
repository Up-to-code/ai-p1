import type { ElementType } from "react";

export type OrgFilterType = "all" | "organization" | "space" | "project";

export type SidebarInboxChannel = {
  id: string;
  name: string;
  type: string;
  visibility: string;
  unreadCount?: number;
  lastMessageAt?: number;
  createdBy: string;
  memberIds: string[];
};

export type IconOption = {
  id: string;
  icon: ElementType;
  label: string;
};
