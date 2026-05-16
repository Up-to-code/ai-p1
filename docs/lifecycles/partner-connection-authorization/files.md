# Files

- `packages/partner-auth-core`: shared partner scope, claim, audience, and OAuth-provider helper contract.
- `packages/partner-workspace-sync`: shared Partners-to-Workspace OAuth runtime projection contract, status mapping, scope normalization, platform API schemas, and sync logging helpers.
- `apps/workspace/convex/auth.ts`: Better Auth OAuth provider setup and custom Qentrah organization claims.
- `apps/workspace/convex/partnerApps/apps.ts`: organization connection grant source of truth and runtime access validation.
- `apps/workspace/convex/schema.ts`: `organizationPartnerConnections` schema compatibility boundary.
- `apps/workspace/src/app/oauth/consent/consent-client.tsx`: user approval sends requested resource scopes before Better Auth consent.
- `apps/workspace/src/server/domains/partnerApps/services/access-token.ts`: bearer token verification and organization grant enforcement.
- `apps/workspace/src/server/domains/partnerApps/services/resources.ts`: typed Convex bridge calls for authorized partner/API-key resource reads and writes.
- `apps/workspace/src/server/domains/partnerApps/services/partner-apps.ts`: Partners catalog verification before saving an organization grant; regular partner app creation/review ownership was removed from Workspace.
- `apps/workspace/src/server/domains/partnerApps/routing/router.ts`: Workspace partner API boundary; no longer exposes local partner app creation/review routes.
- `apps/workspace/src/server/domains/partnerApps/handlers/admin-partner-apps.ts`: transition boundary for old Workspace admin review endpoints; validates service boundary then returns explicit gone responses.
- `apps/workspace/src/server/domains/partnerApps/services/admin-partner-apps.ts`: admin bridge token/origin helpers only; app catalog review logic lives in Partners/Admin apps.
- `apps/workspace/src/server/domains/partnerApps/validation/partner-app.schema.ts`: request validators for Workspace-owned connection and token flows only.
- `apps/workspace/src/server/domains/partnerApps/validation/admin-partner-app.schema.ts`: admin route validation boundary for Better Auth OAuth runtime sync only; no partner review payload validation.
- `apps/workspace/src/server/routing/admin/router.ts`: exposes the Workspace admin runtime-sync endpoint used by Partners after review.
- `apps/partners/server/adminPartnerApps.ts`: Partners admin source of truth for review decisions and publisher app status; publishes minimal OAuth runtime projection to Workspace.
- `apps/partners/server/partnerApps.ts`: Partners developer-owned app lifecycle repository; no Workspace review callback path.
- `apps/partners/server/qentrahWorkspace.ts`: Partners-to-Workspace helper for OAuth runtime projection.
- `apps/workspace/src/domains/integrations/store/integrations.view-model.ts`: integrations UI view-model Module for catalog/grant merge, effective status, actions, and detail lookup.
- `apps/workspace/convex/partnerApps/migrations.ts`: pre-cutover migration for old connection field names.
- `packages/partner-auth-core/README.md`: short package-boundary note so shared exports are discoverable without reading all source.

## Related Tests

- `packages/partner-auth-core/src/index.test.ts`
- `apps/workspace/src/server/domains/partnerApps/services/access-token.test.ts`
- `apps/workspace/src/server/domains/partnerApps/services/partner-apps.test.ts`
- `apps/workspace/src/server/domains/partnerApps/services/admin-partner-apps.test.ts`
- `apps/workspace/src/server/domains/partnerApps/validation/admin-partner-app.schema.test.ts`
- `apps/partners/server/qentrahWorkspace.test.ts`
- `apps/partners/lib/qentrah-integration/contracts.test.ts`
- `apps/workspace/src/domains/integrations/store/integrations.view-model.test.ts`
