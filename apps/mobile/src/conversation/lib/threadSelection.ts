type ThreadSummary = {
  _id: string;
};

type ThreadSelectionArgs = {
  activeThreadId: string | null;
  isCreatingThread: boolean;
  threads: ThreadSummary[];
  threadsLoaded: boolean;
  threadsRefreshing?: boolean;
  hasTransientTurn?: boolean;
};

export function resolveActiveConversationThreadId({
  activeThreadId,
  isCreatingThread,
  threads,
  threadsLoaded,
}: ThreadSelectionArgs) {
  if (isCreatingThread || !threadsLoaded) {
    return activeThreadId;
  }

  if (!activeThreadId) {
    return null;
  }

  return threads.some((thread) => thread._id === activeThreadId)
    ? activeThreadId
    : null;
}

export function canQueryConversationThread({
  activeThreadId,
  isCreatingThread,
  threads,
  threadsLoaded,
  threadsRefreshing = false,
  hasTransientTurn = false,
}: ThreadSelectionArgs) {
  if (!activeThreadId || isCreatingThread || !threadsLoaded) {
    return false;
  }

  if (threadsRefreshing && hasTransientTurn) {
    return true;
  }

  return threads.some((thread) => thread._id === activeThreadId);
}
