type ThreadScopeArgs = {
  activeThreadId: string | null;
  previousOrganizationId: string | null;
  nextOrganizationId: string | null;
};

export function shouldResetConversationForOrganizationScope({
  activeThreadId,
  previousOrganizationId,
  nextOrganizationId,
}: ThreadScopeArgs) {
  if (!activeThreadId) return false;
  if (!nextOrganizationId) return false;
  return previousOrganizationId !== nextOrganizationId;
}
