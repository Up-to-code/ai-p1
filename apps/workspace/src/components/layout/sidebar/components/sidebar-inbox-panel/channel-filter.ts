import type { OrgFilterType, SidebarInboxChannel } from "./types";

export function filterChannelsByScope(channels: SidebarInboxChannel[], selectedOrgFilter: OrgFilterType) {
  return channels.filter((channel) => {
    if (selectedOrgFilter === "all") return true;
    if (selectedOrgFilter === "organization") return channel.type === "organization";
    if (selectedOrgFilter === "space") return channel.type === "space";
    if (selectedOrgFilter === "project") return channel.type === "project";
    return true;
  });
}

export function groupInboxChannels(channels: SidebarInboxChannel[]) {
  return {
    organization: channels.filter((channel) => channel.type === "organization"),
    spaces: channels.filter((channel) => channel.type === "space"),
    projects: channels.filter((channel) => channel.type === "project"),
    directMessages: channels.filter((channel) => channel.type === "dm"),
    clients: channels.filter((channel) => channel.type === "client"),
  };
}
