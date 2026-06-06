# Changes

## 2026-06-06 Mobile Push Notification Settings

- Added the real Profile Notifications tab for mobile push status, personal reminder defaults, category opt-out, and mobile-device readiness.
- Added Workspace notification device and preference API wrappers so the web profile screen configures mobile reminders without adding browser push in v1.
- Preserved existing profile tabs, profile form behavior, avatar behavior, and local profile preference store behavior.

## 2026-05-28 Profile Settings View-Model Depth

- Added the Profile settings view-model Module so profile screens no longer own tab vocabulary, account-to-form projection, role permission presentation, initials, or notification entry normalization inline.
- Preserved local profile store behavior, profile form validation, notification toggle behavior, avatar upload behavior, and rendered route behavior.
- Added focused tests for tab vocabulary, form value projection, role fallback behavior, initials, and notification entry normalization.

## 2026-05-28 Profile Picture Crop View-Model Depth

- Added the Profile picture crop view-model Module so avatar upload rendering no longer owns crop dimensions, accepted image types, cover layout math, or pan clamping inline.
- Preserved avatar upload, crop export, profile avatar save/remove routes, Better Auth user image updates, and toast behavior.
- Added focused tests for accepted image types, crop output size, scalar clamping, cover layout, and pan bounds.

## 2026-05-28 Profile Picture Request Depth

- Added the Profile picture request Module so avatar upload rendering no longer owns profile avatar PATCH calls or Better Auth user image updates inline.
- Preserved the `/api/v1/profile/avatar` route, PATCH payloads, Better Auth image updates, save/remove error behavior, and upload UI behavior.
- Added focused tests for save/remove request payloads, Better Auth image updates, server errors, and Better Auth errors.
