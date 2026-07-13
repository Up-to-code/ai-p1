# Verification

- `vitest run convex/clientTasks`
- `vitest run convex/mcp/toolInputs.test.ts agent/lib/domain-update-inputs.test.ts`
- `npm run typecheck`
- `npx convex codegen`
- Workspace production build

Coverage includes contract inventory, configurable statuses, checklist/start-date parity, tenant relation failures, completion transitions, patch omission, shared effects, and delete retry behavior.
