# Changes

## 2026-06-20 — Delegate CRUD create/delete to domain services
- Replaced 6 direct `fetchAuthMutation(api.*.write.createFromHono)` calls with domain service calls
- Replaced 6 direct `fetchAuthMutation(api.*.write.deleteFromHono)` calls with domain service calls
- Replaced 3 direct `fetchAuthMutation(api.*.write.updateFromHono)` calls with `updateClient`/`updateProject`/`updateClientTask`
- Removed duplicate imports for Convex write APIs (clients, projects, clientTasks)
- Kept inline update logic for calendar (different read pattern) and notifications
- Net: 319 → 297 lines, architectural alignment with domain services
