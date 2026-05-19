export const MOBILE_STORE_VERSION = 4;

export function migratePersistedAppStore(state: unknown, version: number) {
  if (!state || typeof state !== "object") {
    return state;
  }

  let nextState = state as Record<string, unknown>;

  if (version < 2) {
    const { guestMode: _guestMode, ...withoutGuestMode } = nextState;
    nextState = withoutGuestMode;
  }

  if (version < 3) {
    const {
      activeThreadId: _activeThreadId,
      guestMirrorActiveThreadId: _guestMirrorActiveThreadId,
      ...withoutStaleThreadSelection
    } = nextState;
    nextState = withoutStaleThreadSelection;
  }

  if (version < 4) {
    nextState = {
      localePreference: "system",
      ...nextState,
    };
  }

  return nextState;
}
