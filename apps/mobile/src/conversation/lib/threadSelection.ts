type ThreadSummary = {
  _id: string;
};

type ThreadSelectionArgs = {
  activeThreadId: string | null;
  isCreatingThread: boolean;
  threads: ThreadSummary[];
  threadsLoaded: boolean;
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

  const fallbackThreadId = threads[0]?._id ?? null;
  if (!activeThreadId) {
    return fallbackThreadId;
  }

  return threads.some((thread) => thread._id === activeThreadId)
    ? activeThreadId
    : fallbackThreadId;
}

export function canQueryConversationThread({
  activeThreadId,
  isCreatingThread,
  threads,
  threadsLoaded,
}: ThreadSelectionArgs) {
  if (!activeThreadId || isCreatingThread || !threadsLoaded) {
    return false;
  }

  return threads.some((thread) => thread._id === activeThreadId);
}
