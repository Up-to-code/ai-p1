# Maestro for Qentrah Mobile

This app now includes a starter Maestro workspace in `apps/mobile/.maestro`.

## Included flows

- `flows/ai-sign-in-required.yaml`
  Verifies the auth entry screen loads without a guest or anonymous AI entry point.
- `flows/email-entry.yaml`
  Verifies the social auth entry screen exposes Google and Apple without the email entry point.
- `flows/menu-profile-appearance.yaml`
  Verifies a signed-in QA user can navigate from the app shell into profile and appearance settings, and switch appearance modes.
- `flows/menu-collections-empty-states.yaml`
  Verifies a signed-in QA user can reach saved/favorite conversations from the menu and see the empty state.
- `flows/auth-sign-in.yaml`
  Verifies the social auth entry controls are present on the auth screen.
- `flows/agent-property-search.yaml`
  Verifies the signed-in QA user can create a fresh thread and receive the seeded property bundle.
- `flows/history-and-agent-context.yaml`
  Verifies the signed-in QA user can reopen a seeded market-context thread from the archive.

## Shared setup

- `flows/shared/bootstrap-auth.yaml`
  Opens the Expo dev client and resets the app to the auth entry screen.
- `flows/shared/bootstrap-signed-in.yaml`
  Signs into deterministic QA mode, then clears saved state and thread state before each signed-in flow.
- `flows/shared/search-property.yaml`
  Creates a new thread and sends the seeded property-search prompt.
- `flows/shared/search-market-context.yaml`
  Creates a new thread and sends the seeded pricing and market-context prompt.

## Run locally

1. Install Maestro CLI from the official docs: https://docs.maestro.dev
2. Boot an iOS simulator or Android emulator.
3. Start a native/dev build of the app so `com.qentrah.mobile` is installed.
4. Run one of:

```bash
npm run maestro:smoke
npm run maestro:test
```

Or from the app workspace:

```bash
npm --workspace apps/mobile run maestro:smoke
```

## Notes

- The current flows target the installed native app id `com.qentrah.mobile`.
- The auth entry points now expose stable `testID` values so Maestro flows do not depend on button copy.
- QA fixture mode is available only in development builds through `qentrah://e2e/reset-auth`, `qentrah://e2e/login-qa`, `qentrah://e2e/reset-user-state`, and `qentrah://e2e/reset-thread-state`.
- The deterministic QA credentials for Maestro are `qa@qentrah.test` and `qa-password`.
- If you want Expo Go coverage too, add a separate flow that uses `openLink` with your local Expo URL, per Maestro's React Native guidance.
