# Maestro for Zayon Mobile

This app now includes a starter Maestro workspace in `apps/mobile/.maestro`.

## Included flows

- `flows/guest-mode.yaml`
  Verifies the auth entry screen loads and guest mode can reach the app shell.
- `flows/email-entry.yaml`
  Verifies the email auth entry path and advances from the email screen into the password screen.
- `flows/menu-profile-appearance.yaml`
  Verifies a guest user can navigate from the app shell into profile and appearance settings, and switch appearance modes.
- `flows/menu-collections-empty-states.yaml`
  Verifies a guest user can reach Saved Properties and Compare Tray from the menu and see their empty states.
- `flows/auth-sign-in.yaml`
  Verifies the deterministic QA sign-in path can move from auth screens into the app shell.
- `flows/agent-property-search.yaml`
  Verifies the signed-in QA user can create a fresh thread and receive the seeded property bundle.
- `flows/property-save-and-detail.yaml`
  Verifies a signed-in QA user can open a seeded property, save it, and find it in Saved Properties.
- `flows/compare-and-pricing.yaml`
  Verifies the signed-in QA user can compare seeded properties and inspect pricing-oriented rows.
- `flows/history-and-agent-context.yaml`
  Verifies the signed-in QA user can reopen a seeded market-context thread from the archive.

## Shared setup

- `flows/shared/bootstrap-auth.yaml`
  Opens the Expo dev client and resets the app to the auth entry screen.
- `flows/shared/bootstrap-guest.yaml`
  Starts from auth and enters guest mode before continuing into shell-based flows.
- `flows/shared/bootstrap-signed-in.yaml`
  Signs into deterministic QA mode, then clears saved state and thread state before each signed-in flow.
- `flows/shared/search-property.yaml`
  Creates a new thread and sends the seeded property-search prompt.
- `flows/shared/search-market-context.yaml`
  Creates a new thread and sends the seeded pricing and market-context prompt.

## Run locally

1. Install Maestro CLI from the official docs: https://docs.maestro.dev
2. Boot an iOS simulator or Android emulator.
3. Start a native/dev build of the app so `com.zayon.mobile` is installed.
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

- The current flows target the installed native app id `com.zayon.mobile`.
- The auth entry points now expose stable `testID` values so Maestro flows do not depend on button copy.
- QA fixture mode is available only in development builds through `zayon://e2e/reset-auth`, `zayon://e2e/login-qa`, `zayon://e2e/reset-user-state`, and `zayon://e2e/reset-thread-state`.
- The deterministic QA credentials for Maestro are `qa@zayon.ai` and `qa-password`.
- If you want Expo Go coverage too, add a separate flow that uses `openLink` with your local Expo URL, per Maestro's React Native guidance.
