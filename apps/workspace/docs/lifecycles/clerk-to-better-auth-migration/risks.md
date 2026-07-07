# Risks

| Risk | Mitigation |
|---|---|
| Google/Apple OAuth credentials needed | Get from Google Cloud Console / Apple Developer |
| Schema migration — `authTables` from `@convex-dev/better-auth` | `authTables` adds new tables; existing tables untouched. Run `convex codegen` after |
| Email sending not wired | Wire Resend for password reset + invitation emails in Wave 1 |
| `organizationInviteLinks` Convex table | Keep as-is; custom invite links call `auth.api.inviteMember` server-side after token validation |
| Eve ESM loader removal safe | Safe once `@clerk/nextjs` is gone — Node 24 ESM issue was Clerk-specific |
| Dual-auth during migration | Clerk and Better Auth coexist during Waves 0-7; delete Clerk in Wave 8 |
| MCP OAuth `.well-known` endpoints | Need custom implementation for `authServerMetadataHandlerClerk`/`protectedResourceHandlerClerk` replacements |
