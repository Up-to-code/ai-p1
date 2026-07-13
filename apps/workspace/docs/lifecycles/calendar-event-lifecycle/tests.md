# Verification

- `vitest run convex/calendar`
- `vitest run convex/mcp/toolInputs.test.ts agent/lib/domain-update-inputs.test.ts`
- `npm run typecheck`
- `npx convex codegen`
- Workspace production build

Coverage includes contract inventory, invalid intervals, partial interval conflicts, cross-Organization links, patch omission, reminder replacement, audit attribution, and repeated delete behavior.
