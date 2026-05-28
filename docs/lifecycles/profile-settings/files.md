# Files

- `apps/workspace/src/domains/profile/components/profile-settings-screen.tsx`: user-facing profile, notification, and security settings screen.
- `apps/workspace/src/domains/profile/profile-view-model.ts`: profile settings view-model Module for tab vocabulary, form value projection, initials, role presentation, permission keys, and notification entries.
- `apps/workspace/src/domains/profile/store/profile.store.ts`: local profile preference store for phone, role, language, timezone, and notification toggles.
- `apps/workspace/src/domains/profile/validation/profile.schema.ts`: profile form validation contract.
- `apps/workspace/src/components/custom/profile-picture-uploader.tsx`: avatar upload, crop, save, and remove UI used by the profile screen.
- `apps/workspace/src/components/custom/profile-picture-view-model.ts`: avatar crop view-model Module for crop dimensions, accepted image types, cover layout, and crop pan clamping.
- `apps/workspace/src/components/custom/profile-picture-request.ts`: avatar request Module for profile avatar save/remove PATCH calls and Better Auth user image updates.
