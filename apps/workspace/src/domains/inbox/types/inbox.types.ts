export type ChannelType = "organization" | "project" | "space" | "client" | "dm";

export type ChannelVisibility = "public" | "private" | "dm";

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  visibility: ChannelVisibility;
  organizationId: string;
  projectId?: string;
  spaceId?: string;
  clientId?: string;
  memberIds: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  description?: string;
  unreadCount?: number;
  lastMessageAt?: number;
}

export interface Message {
  id: string;
  channelId: string;
  content: string;
  authorId: string;
  createdAt: number;
  updatedAt: number;
  threadId?: string;
  replyToId?: string;
  reactions?: MessageReaction[];
  mentions?: MessageMention[];
  attachments?: MessageAttachment[];
  isDeleted?: boolean;
  editedAt?: number;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface MessageMention {
  type: "user" | "task" | "client" | "deal" | "project" | "document" | "file";
  id: string;
  name: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Thread {
  id: string;
  channelId: string;
  parentMessageId: string;
  messageCount: number;
  participantIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface InboxState {
  activeChannelId: string | null;
  sidebarOpen: boolean;
  unreadChannels: Set<string>;
}
