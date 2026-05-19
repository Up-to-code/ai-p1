let openedSessionId: string | null = null;
let lastScreenViewKey: string | null = null;

export function shouldTrackAppOpen(sessionId: string) {
  if (openedSessionId === sessionId) {
    return false;
  }

  openedSessionId = sessionId;
  return true;
}

export function shouldTrackScreenView(sessionId: string, route: string) {
  const key = `${sessionId}:${route}`;
  if (lastScreenViewKey === key) {
    return false;
  }

  lastScreenViewKey = key;
  return true;
}

export function resetSessionTrackerState() {
  openedSessionId = null;
  lastScreenViewKey = null;
}
