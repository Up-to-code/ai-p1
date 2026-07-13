# Verification

- `vitest run convex/clients convex/security/clientPii.test.ts`
- `vitest run convex/mcp/toolInputs.test.ts agent/lib/domain-update-inputs.test.ts`
- `npm run typecheck`
- `npx convex codegen`
- Workspace production build

Coverage includes contract field parity, invalid priorities, defaults, tenant mismatch, patch omission, PII omission/clear behavior, single soft-delete effects, and adapter patch behavior.
