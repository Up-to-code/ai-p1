"use client";

import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useAuthSession } from "@/domains/auth";
import { logger } from "@/lib/logger";

export type InboxAttentionView = "primary" | "other" | "later" | "cleared";
export type InboxAttentionFilter = "all" | "mentions" | "assigned";
export type InboxReplyStatus = "unread" | "read";

export function useInboxAttention(
  view: InboxAttentionView,
  filter: InboxAttentionFilter,
) {
  const organizationId = useAuthSession().workspace.organizationId;
  const events = useQuery(
    api.notifications.inbox.listAttention,
    organizationId ? { organizationId, view, filter } : "skip",
  );
  const markReadMutation = useMutation(api.notifications.inbox.markRead);
  const markAllReadMutation = useMutation(api.notifications.inbox.markAllRead);
  const transitionMutation = useMutation(api.notifications.inbox.transitionEvent);

  function markRead(eventId: Id<"notificationEvents">) {
    if (!organizationId) return;
    void markReadMutation({ organizationId, eventId }).catch((error) =>
      logger.error("inbox.mark_read_failed", { eventId, error }),
    );
  }

  function markAllRead() {
    if (!organizationId) return;
    void markAllReadMutation({
      organizationId,
      surface: "attention",
      view,
    }).catch((error) =>
      logger.error("inbox.mark_all_read_failed", { view, error }),
    );
  }

  function transition(
    eventId: Id<"notificationEvents">,
    action: "later" | "clear" | "restore",
  ) {
    if (!organizationId) return;
    void transitionMutation({
      organizationId,
      eventId,
      transition: action,
    }).catch((error) =>
      logger.error("inbox.transition_failed", { eventId, action, error }),
    );
  }

  return {
    events,
    isLoading: events === undefined,
    markRead,
    markAllRead,
    transition,
  };
}

export function useInboxReplies(status: InboxReplyStatus) {
  const organizationId = useAuthSession().workspace.organizationId;
  const events = useQuery(
    api.notifications.inbox.listReplies,
    organizationId ? { organizationId, status } : "skip",
  );
  const markReadMutation = useMutation(api.notifications.inbox.markRead);
  const markAllReadMutation = useMutation(api.notifications.inbox.markAllRead);

  function markRead(eventId: Id<"notificationEvents">) {
    if (!organizationId) return;
    void markReadMutation({ organizationId, eventId }).catch((error) =>
      logger.error("inbox.reply_mark_read_failed", { eventId, error }),
    );
  }

  function markAllRead() {
    if (!organizationId) return;
    void markAllReadMutation({ organizationId, surface: "replies" }).catch(
      (error) => logger.error("inbox.replies_mark_all_read_failed", { error }),
    );
  }

  return {
    events,
    isLoading: events === undefined,
    markRead,
    markAllRead,
  };
}
