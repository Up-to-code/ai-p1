# Workspace Visual System Refresh

## Objective

Bring the authenticated Qentrah workspace into the same visual family as the
marketing and authentication surfaces: calm black-and-white foundations,
generous spacing, flat bordered surfaces, compact controls, restrained color,
and consistent loading states. This is a presentation migration. Existing
routes, permissions, queries, mutations, navigation behavior, and public
component APIs remain unchanged unless a later packet explicitly documents an
exception.

## Visual Contract

- Use the existing `--q-*` semantic tokens as the only color source.
- Prefer white/neutral surfaces with one-pixel borders; no decorative card
  shadows or hover elevation.
- Use the radius scale consistently: controls `--radius-md`, cards
  `--radius-xl`, dialogs `--radius-2xl`, pills only for compact status.
- Use 40px default controls and 48px primary or auth controls.
- Use an 8px spacing rhythm, with 24px card padding and 32px page-section gaps.
- Reserve saturated domain colors for status, priority, charts, and identity.
- Keep auth/entry gradients on entry surfaces. The operating workspace stays
  visually quiet and content-led.
- Every real screen gets a matching skeleton with the same geometry.
- Preserve RTL, keyboard focus, reduced motion, mobile overflow, and dark mode.

## Module Boundaries

1. **Design tokens** — `design-system.json` and `apps/workspace/src/app/globals.css`
   own color, spacing, radius, typography, motion, and elevation policy.
2. **UI primitives** — `apps/workspace/src/components/ui/` owns controls,
   dialogs, menus, tabs, tables, and feedback surfaces. Domain screens compose
   these primitives instead of restyling their internals.
3. **Workspace chrome** — `apps/workspace/src/components/layout/` owns the rail,
   secondary panel, topbar, global search, and route-transition treatment.
4. **Workspace home** — `apps/workspace/src/domains/workspace/` and
   `apps/workspace/src/domains/dashboard/` own the command-center composition,
   not global shell behavior.
5. **Domain surfaces** — tasks, projects, clients, deals, docs, inbox, calendar,
   team, automations, settings, and AI migrate in independent packets while
   preserving their data hooks and mutations.
6. **Loading parity** — `apps/workspace/src/components/loading/` owns skeleton
   geometry shared by route boundaries and client auth/session transitions.
7. **Registry** — every new reusable visual primitive is added to
   `component-registry.json` in the packet that introduces it.

## Migration Packets

### Packet 1: Foundation and primitive audit

Current behavior: semantic tokens exist, but components still mix legacy
radius, shadow, and spacing utilities.

Structural improvement: finalize the flat surface contract, align buttons,
inputs, dialogs, cards, skeletons, tabs, and table primitives, and remove
conflicting elevation defaults.

Validation check: TypeScript, primitive interaction tests, dark/RTL review,
focus-visible review, and React Doctor on changed files.

Touches: `design-system.json`, `globals.css`, `components/ui/`,
`component-registry.json`.

### Packet 2: Workspace shell

Current behavior: the rail, secondary panel, topbar, search, and main canvas use
different densities and surface treatments.

Structural improvement: establish one shell grid, quiet chrome, consistent
dividers, compact navigation rows, and a stable content canvas matching the
marketing/auth typography and spacing.

Validation check: sidebar/topbar source tests, keyboard navigation, collapsed
and expanded panels, mobile overlay, LTR/RTL, and session-loading parity.

Touches: `components/layout/sidebar/`, `components/layout/topbar/`,
`components/layout/workspace-global-search/`, `components/providers/`,
`components/loading/workspace-shell-skeleton.tsx`.

### Packet 3: Workspace home and dashboards

Current behavior: home and dashboard regions use mixed card geometry and
loading placeholders.

Structural improvement: apply the new page header, section spacing, bordered
panels, table frame, empty state, and command-center hierarchy.

Validation check: workspace home tests, dashboard view-model tests, responsive
layouts, empty/loading/error states, and widget interactions.

Touches: `domains/workspace/`, `domains/dashboard/`, `app/[locale]/(app)/ws/`.

### Packet 4: Core work domains

Current behavior: Tasks, Projects, Clients, Deals, Docs, and Calendar each carry
local interpretations of controls, cards, tables, and editors.

Structural improvement: migrate one domain per issue-sized packet using the
shared primitives, keeping domain orchestration and data hooks unchanged.

Validation check: focused domain tests, create/edit/delete flows, optimistic
rollback, loading/error/empty states, and responsive table/board behavior.

Touches: `domains/tasks/`, `domains/projects/`, `domains/clients/`,
`domains/deals/`, `domains/docs/`, `domains/calendar/`.

### Packet 5: Collaboration and administration

Current behavior: Inbox, Team, Spaces, Settings, Automations, and organization
panels use several modal, panel, and list-row styles.

Structural improvement: converge list rows, panels, member states, settings
forms, dialogs, and automation inspectors on the same density and hierarchy.

Validation check: invitation/member flows, permissions and disabled states,
automation canvas interactions, settings forms, and localization.

Touches: `domains/inbox/`, `domains/team/`, `domains/spaces/`,
`domains/settings/`, `domains/automations/`, `domains/organization/`.

### Packet 6: AI, MCP, integrations, and final consistency pass

Current behavior: newer AI/MCP surfaces and older integration screens use
different message, tool, and status treatments.

Structural improvement: align chat, tool calls, connection states, integration
cards, and residual shared components; remove obsolete visual variants.

Validation check: agent/chat flows, MCP states, integration connect/manage
states, full React Doctor scan, visual route matrix, and production build.

Touches: `domains/eve/`, `domains/mcp/`, `domains/integrations/`, remaining
`components/shared/`, and the component registry.

## Global Parity Checklist

- No server contract, Convex validator, Hono route, or permission rule changes.
- No client-owned duplicate of Convex server data.
- Existing navigation targets and deep links remain valid.
- All dialogs retain focus trapping, escape/close behavior, and busy states.
- Every query-backed view shows distinct loading, error, empty, and data states.
- English and Arabic remain complete; RTL is reviewed per packet.
- Light and dark themes use semantic tokens rather than hardcoded fallback
  colors.
- `npm --workspace @qentrah/workspace run typecheck` passes after every packet.
- Focused Vitest suites pass after every packet; React Doctor runs on changed
  files and on the full app at the end.

## Recommended First Implementation

Start with Packet 1 and Packet 2 as separate commits/issues. Updating domain
screens before the primitive and shell contracts are stable would multiply
one-off class changes and make the final result less consistent.
