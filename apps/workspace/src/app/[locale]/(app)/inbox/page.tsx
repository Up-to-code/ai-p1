"use client";

import { useState, useEffect } from "react";
import { useAccountContext } from "@/domains/auth";
import { useInboxState, useMessagesQuery, useSendMessageMutation, useCreateChannelMutation } from "@/domains/inbox";
import { MessageList } from "@/domains/inbox/components/message-list";
import { MessageComposer } from "@/domains/inbox/components/message-composer";
import { InboxIcon } from "@/components/layout/sidebar/components/clickup-icons";
import { Info, MessageSquare, Building2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChannelType, ChannelVisibility } from "@/domains/inbox/types/inbox.types";

export default function InboxPage() {
  const account = useAccountContext();
  const { orgId, channels, isLoadingChannels } = useInboxState();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; author: string; content: string } | null>(null);

  // Sync with URL parameter for channel selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const channelId = params.get("channel");
    if (channelId && channels.find((c) => c.id === channelId)) {
      setActiveChannelId(channelId);
    } else if (!activeChannelId && channels.length > 0) {
      // Auto-select first channel if none selected
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const messages = useMessagesQuery(activeChannelId || undefined);
  const isLoadingMessages = false; // Convex queries load synchronously for now
  const sendMessageMutation = useSendMessageMutation(orgId || undefined, activeChannelId || undefined);
  const createChannelMutation = useCreateChannelMutation(orgId || undefined);

  const handleSendMessage = (content: string) => {
    if (activeChannelId) {
      sendMessageMutation.mutate(content);
    }
  };

  const handleCreateChannel = (data: {
    name: string;
    type: ChannelType;
    visibility: ChannelVisibility;
    description?: string;
    projectId?: string;
    clientId?: string;
    memberIds?: string[];
  }) => {
    createChannelMutation.mutate(data);
  };

  return (
    <div className="flex h-full bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            {/* Channel Header */}
            <div className="h-14 border-b border-border/50 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  <InboxIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{activeChannel.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeChannel.description || "Organization channel"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={account.user?.id || ""}
              onReply={(messageId) => {
                const message = messages.find((m) => m.id === messageId);
                if (message) {
                  setReplyTo({
                    id: messageId,
                    author: message.authorId === account.user?.id ? "You" : message.authorId.slice(0, 8),
                    content: message.content,
                  });
                }
              }}
              onEdit={(messageId, content) => {
                // TODO: Implement edit
                console.log("Edit message", messageId, content);
              }}
              onDelete={(messageId) => {
                // TODO: Implement delete
                console.log("Delete message", messageId);
              }}
              onReaction={(messageId, emoji) => {
                // TODO: Implement reaction
                console.log("Add reaction", messageId, emoji);
              }}
              isLoading={isLoadingMessages}
            />

            {/* Message Composer */}
            <MessageComposer
              onSend={handleSendMessage}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              disabled={sendMessageMutation.isPending}
              placeholder={`Message #${activeChannel.name}`}
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <InboxIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Welcome to Inbox
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select a channel from the sidebar to start messaging your team
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2 mx-auto">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Real-time messaging</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2 mx-auto">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Organization channels</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2 mx-auto">
                    <Link2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Business integrations</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
