# Ara Strict Mode - FRONTEND-LIBRARIES.md

Current date: May 2026.

Platform: Saudi Arabia Central Real Estate Data Hub. This is a synchronization engine. The frontend exists to review submissions, inspect canonical property records, manage visibility by platform and audience, approve integrations, inspect synchronization state, and audit activity. It is not a CRM. It is not a marketplace product. It is not a lead pipeline.

Mandatory stack:

- `next` `16.2.4`
- TypeScript
- Convex Database with Convex React client
- `@convex-dev/better-auth`
- ShadCN/UI
- Tailwind CSS
- Lucide React
- Zod

Frontend rule: use ShadCN/UI official components as primitives. Compose feature components from ShadCN primitives. Do not write custom Button, Table, Dialog, AlertDialog, Badge, Input, Select, Tabs, Tooltip, DropdownMenu, Sheet, Skeleton, Form, or Card primitives.

## 1. Source and Version Basis

Versions checked from current NPM metadata:

| Package | Version Checked | Category |
| --- | ---: | --- |
| `next` | `16.2.4` | App framework |
| `shadcn` | `4.6.0` | ShadCN CLI |
| `tailwindcss` | `4.2.4` | Styling |
| `convex` | `1.37.0` | Convex client and generated API |
| `@convex-dev/react-query` | `0.1.0` | Convex adapter for TanStack Query |
| `react-hook-form` | `7.75.0` | Forms |
| `@hookform/resolvers` | `5.2.2` | Form validation resolver |
| `zod` | `4.4.3` | Validation |
| `@tanstack/react-table` | `8.21.3` | Data tables |
| `@tanstack/react-virtual` | `3.13.24` | Virtualized lists and tables |
| `@tanstack/react-query` | `5.100.9` | Data fetching/cache adapter use cases |
| `zustand` | `5.0.12` | Client-only state |
| `nuqs` | `2.8.9` | URL search param state |
| `sonner` | `2.0.7` | Notifications |
| `motion` | `12.38.0` | Animations |
| `lucide-react` | `1.14.0` | Icons |
| `recharts` | `3.8.1` | Charts |
| `next-themes` | `0.4.6` | Theme switching |
| `class-variance-authority` | `0.7.1` | Component variants |
| `clsx` | `2.1.1` | Conditional class names |
| `tailwind-merge` | `3.5.0` | Tailwind class conflict merge |
| `tw-animate-css` | `1.4.0` | Tailwind v4 animation utilities |
| `date-fns` | `4.1.0` | Date formatting |
| `react-day-picker` | `9.14.0` | Calendar/date picker used by ShadCN Calendar |

Reference points:

- ShadCN Data Table uses TanStack Table with ShadCN Table primitives.
- ShadCN Chart uses Recharts v3.
- Convex React `useQuery` is reactive; when underlying data changes, subscribed components rerender.
- `@convex-dev/react-query` connects Convex queries to TanStack Query and receives reactive Convex updates, but the adapter is beta. Use it selectively.

## 2. Final Recommended Frontend Library Stack

### 2.1 Required First-Wave Libraries

Install and use these for the hub frontend:

```txt
next@16.2.4
convex@1.37.0
shadcn@4.6.0
tailwindcss@4.2.4
react-hook-form@7.75.0
@hookform/resolvers@5.2.2
zod@4.4.3
@tanstack/react-table@8.21.3
@tanstack/react-virtual@3.13.24
nuqs@2.8.9
sonner@2.0.7
motion@12.38.0
lucide-react@1.14.0
recharts@3.8.1
next-themes@0.4.6
class-variance-authority@0.7.1
clsx@2.1.1
tailwind-merge@3.5.0
tw-animate-css@1.4.0
date-fns@4.1.0
react-day-picker@9.14.0
```

### 2.2 Conditional Libraries

Install only if the stated need exists:

```txt
@tanstack/react-query@5.100.9
@convex-dev/react-query@0.1.0
zustand@5.0.12
```

Rules:

- Use Convex React hooks first for hub data.
- Use TanStack Query only when the screen needs Query result ergonomics, external non-Convex fetches, or a specific integration with TanStack tooling.
- Use Zustand only for client-only UI state that does not belong in Convex, URL parameters, React component state, or form state.

## 3. Forms

### 3.1 `react-hook-form`

Package: `react-hook-form`

Version checked: `7.75.0`

Adoption decision: Required.

What it does:

- Provides performant React forms with controlled and uncontrolled inputs.
- Tracks field values, dirty state, validation state, touched state, submit state, and errors.
- Supports field arrays for repeated sections.

Why it reduces work:

- Avoids hand-written form state.
- Avoids hand-written touched/dirty tracking.
- Avoids hand-written field error display.
- Avoids re-rendering the full form on every input when used correctly.
- Gives one repeatable pattern for large property, integration, publisher, visibility, and settings forms.

How it works with ShadCN/UI:

- ShadCN Form is designed around `react-hook-form`.
- Use ShadCN `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, and `FormMessage`.
- Use ShadCN `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Calendar`, `Popover`, and `Button` inside `FormControl`.
- Do not create custom form primitives.

How it works with Convex:

- Submit handlers call Convex mutations.
- Use Convex mutation pending state to disable submit buttons.
- Use mutation errors to show ShadCN `FormMessage` for field-specific errors when possible.
- Use Sonner for non-field success or failure notifications.
- Do not write directly to Convex from `onChange` for large forms.

Hub use cases:

- Property submission correction form.
- Submission review decision form.
- Visibility policy editor.
- Connected platform registration form.
- Webhook URL validation form.
- Publisher organization profile form.
- Compliance settings form.
- API key creation form.

Implementation rules:

- Every form schema must use Zod.
- Every form must define `defaultValues`.
- Every form submit must be idempotent at the mutation level when it changes sync state.
- Disable destructive submit buttons while pending.
- Do not store raw API keys in form state after one-time reveal.
- Do not store sensitive document values in client state longer than needed.

### 3.2 `@hookform/resolvers`

Package: `@hookform/resolvers`

Version checked: `5.2.2`

Adoption decision: Required.

What it does:

- Connects validation libraries to React Hook Form.
- Provides `zodResolver`.

Why it reduces work:

- Avoids manual mapping from Zod errors to form fields.
- Keeps client form validation aligned with server payload validation.
- Reduces duplicate validation rules.

How it works with ShadCN/UI:

- `zodResolver(schema)` feeds errors into ShadCN `FormMessage`.
- ShadCN form components display field state without custom error components.

How it works with Convex:

- The same domain Zod schema can shape form data before calling Convex mutations.
- Server-side Convex functions still validate with Convex validators and server Zod schemas where external boundaries exist.

Hub use cases:

- Reject invalid Saudi title deed reference format before submit.
- Reject invalid Ejar lease reference before submit.
- Reject invalid Wafi/off-plan reference before submit.
- Reject invalid National Address field groups before submit.
- Reject invalid webhook URL before sending validation challenge.
- Reject weak visibility policy shapes before saving.

### 3.3 `zod`

Package: `zod`

Version checked: `4.4.3`

Adoption decision: Required.

What it does:

- Defines runtime schemas.
- Infers TypeScript types.
- Validates form values and API payloads.

Why it reduces work:

- One schema controls form type, form validation, payload validation, and test fixture shape.
- Eliminates weak string statuses.
- Eliminates manual nested property validation.

How it works with ShadCN/UI:

- Zod errors flow through `zodResolver` into ShadCN Form components.
- Zod enums drive ShadCN Select options.
- Zod discriminated unions drive conditional form sections.

How it works with Convex:

- External payloads are validated by Zod before Convex mutation/action work proceeds.
- Convex schema validators still protect database structure.
- Zod is used for frontend and public API contracts; Convex validators are used for Convex function arguments and table schema.

Hub use cases:

- `SaudiPropertySubmissionFormSchema`
- `VisibilityPolicyFormSchema`
- `IntegrationRequestFormSchema`
- `WebhookEndpointFormSchema`
- `PublisherProfileFormSchema`
- `ApprovalDecisionFormSchema`
- `SuppressionReasonFormSchema`

Rules:

- No `null` recommendation.
- Use optional omitted fields or explicit state literals.
- Use `z.enum` for statuses.
- Use strict objects.
- Use discriminated unions for property type variants.

### 3.4 `react-day-picker`

Package: `react-day-picker`

Version checked: `9.14.0`

Adoption decision: Required when date picking is needed.

What it does:

- Provides date picker logic.

Why it reduces work:

- Avoids writing calendar interaction logic.
- Supports ShadCN Calendar patterns.

How it works with ShadCN/UI:

- ShadCN Calendar uses DayPicker underneath.
- Use ShadCN `Calendar` inside `Popover`.
- Use ShadCN `Button` as the trigger.

How it works with Convex:

- Convert date selections to explicit ISO date strings or timestamps before mutation.
- Keep timezone handling explicit.

Hub use cases:

- Listing expiry date.
- Ejar lease start and end date.
- Off-plan project completion date.
- Approval due date.
- API key expiry date.
- Audit log date filter.

### 3.5 `date-fns`

Package: `date-fns`

Version checked: `4.1.0`

Adoption decision: Required for display formatting.

What it does:

- Formats and manipulates dates.

Why it reduces work:

- Avoids manual date formatting.
- Gives consistent display for timestamps and dates.

How it works with ShadCN/UI:

- Use in table cells, badges, form date labels, audit log rows, and dashboard cards.

How it works with Convex:

- Convex stores timestamps as numbers or explicit strings by schema decision.
- Frontend formats values only for display.
- Frontend must not infer compliance deadlines without server confirmation.

Hub use cases:

- Format submission creation time.
- Format approval history.
- Format webhook retry schedule.
- Format property version effective time.
- Format API key last used time.

## 4. Data Tables

### 4.1 `@tanstack/react-table`

Package: `@tanstack/react-table`

Version checked: `8.21.3`

Adoption decision: Required.

What it does:

- Provides headless table logic.
- Handles column definitions.
- Handles sorting, filtering, pagination, row selection, column visibility, and row actions.

Why it reduces work:

- Avoids building table state from scratch.
- Avoids custom sorting state.
- Avoids custom pagination state.
- Avoids custom row selection logic.
- Avoids custom column visibility logic.
- Keeps table logic separate from ShadCN visual primitives.

How it works with ShadCN/UI:

- ShadCN Data Table documentation uses TanStack Table with ShadCN `Table`.
- Use ShadCN `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell`.
- Use ShadCN `DropdownMenu` for row actions.
- Use ShadCN `Checkbox` for row selection.
- Use ShadCN `Input` for filtering.
- Use ShadCN `Button` for pagination controls.
- Use ShadCN `Badge` for status cells.

How it works with Convex:

- Convex queries provide table rows.
- TanStack Table owns client-side table state.
- Server-side pagination should use Convex pagination for large data.
- Table filters that affect backend query scope must live in URL state with `nuqs`.
- Do not load the entire property universe into the browser.

Hub use cases:

- Submissions Inbox table.
- Approved Properties table.
- Connected Platforms table.
- Publishers Directory table.
- Audit Log table.
- Synchronization Events table.
- Visibility Evaluations table.
- API Keys table with redacted key prefix only.

Required table files per feature:

- `columns.tsx`
- `data-table.tsx`
- `table-toolbar.tsx`
- `row-actions.tsx`
- `table-filters.tsx`
- `table-empty-state.tsx`
- `table-loading-state.tsx`
- `table-error-state.tsx`

Rules:

- Column definitions must live outside page files.
- Row actions must live outside column definition files when complex.
- Every action menu item must check UI permission for display.
- Every mutation called by a row action must check server permission.
- Use server pagination for large Convex datasets.
- Use table selection only for approved bulk actions.

### 4.2 `@tanstack/react-virtual`

Package: `@tanstack/react-virtual`

Version checked: `3.13.24`

Adoption decision: Required for large lists and long tables.

What it does:

- Virtualizes scrollable rows and lists.
- Renders only visible rows.

Why it reduces work:

- Avoids custom virtual scrolling.
- Keeps large admin tables responsive.
- Reduces browser rendering cost.

How it works with ShadCN/UI:

- Use ShadCN table styling and TanStack Virtual for row virtualization.
- Keep row height stable.
- Do not let expanding content destroy measurement unless the table is designed for expansion.

How it works with Convex:

- Use with Convex paginated queries for large result sets.
- Virtualization is a rendering optimization, not a data access policy.
- Do not use virtualization to justify loading unauthorized rows.

Hub use cases:

- Audit log with thousands of events.
- Synchronization event stream.
- Integration delivery attempts.
- Property history timeline when long.
- Visibility evaluation matrix for many platforms.

Rules:

- Use virtualization after table requirements prove row volume is high.
- Preserve keyboard access.
- Preserve row action availability.
- Use Skeleton rows during initial load.

## 5. Data Fetching and Caching

### 5.1 `convex`

Package: `convex`

Version checked: `1.37.0`

Adoption decision: Required.

What it does:

- Provides Convex React client.
- Provides `useQuery`, `useMutation`, `useAction`, `usePaginatedQuery`, and generated API typing.
- Subscribes React components to Convex query results.

Why it reduces work:

- Avoids writing REST fetchers for hub data.
- Avoids manual websocket subscriptions.
- Avoids manual cache invalidation for Convex query data.
- Gives generated end-to-end TypeScript typing.
- Automatically updates screens when Convex data changes.

How it works with ShadCN/UI:

- ShadCN components render the result states.
- Use ShadCN Skeleton while Convex query returns initial loading state.
- Use ShadCN Alert or Card for error states.
- Use ShadCN Table for query rows.
- Use ShadCN Badge for reactive status fields.

Hub use cases:

- Dashboard counters updating when submissions arrive.
- Submissions Inbox updating in real time.
- Review screen updating when another reviewer changes state.
- Property detail visibility tab updating after policy changes.
- Synchronization monitor updating as webhooks retry or fail.
- Audit log updating when sensitive actions occur.

Rules:

- Use Convex React hooks for hub data by default.
- Keep Convex query arguments explicit.
- Use `"skip"` for conditional queries.
- Use Convex paginated queries for large lists.
- Do not fetch sensitive admin data through public Next.js route handlers.
- Do not cache sensitive admin query data in public HTTP caches.

### 5.2 `@tanstack/react-query`

Package: `@tanstack/react-query`

Version checked: `5.100.9`

Adoption decision: Conditional.

What it does:

- Manages asynchronous server state.
- Handles query result state, mutation state, retries, background refetching, and cache lifecycle.

Why it reduces work:

- Reduces custom loading, error, and pending state code for non-Convex fetches.
- Provides consistent mutation lifecycle APIs.
- Helps when integrating external HTTP checks from the frontend through approved endpoints.

How it works with ShadCN/UI:

- Query pending state drives ShadCN Skeleton.
- Query error state drives ShadCN Alert or inline error blocks.
- Mutation pending state drives ShadCN Button disabled state.
- Query data can feed ShadCN Table, Card, and Chart components.

How it works with Convex:

- Do not use as the default Convex data layer.
- Use with `@convex-dev/react-query` when a screen benefits from TanStack Query ergonomics and Convex live updates.
- Use standard Convex React hooks when the adapter adds no value.

Hub use cases:

- External integration diagnostic endpoint called through an approved admin route.
- One-off health check UI for webhook endpoint testing.
- Hybrid screen that combines Convex state with a non-Convex static documentation fetch.

Rules:

- Do not use TanStack Query to poll Convex data.
- Do not duplicate Convex reactive state into a second cache without reason.
- Do not use browser cache for sensitive hub records.

### 5.3 `@convex-dev/react-query`

Package: `@convex-dev/react-query`

Version checked: `0.1.0`

Adoption decision: Conditional.

What it does:

- Provides query option functions for using Convex with TanStack Query.
- Allows Convex query subscriptions through TanStack Query hooks.

Why it reduces work:

- Lets screens use TanStack Query result objects while still receiving Convex reactive updates.
- Reduces custom adapter code between Convex and TanStack Query.

How it works with ShadCN/UI:

- Standard TanStack `isPending`, `error`, and `data` states map directly to ShadCN Skeleton, Alert, Table, and Card patterns.

How it works with Convex:

- Connects `ConvexQueryClient` to `QueryClient`.
- Uses `convexQuery` for Convex queries.
- Uses `useConvexMutation` for Convex mutations inside TanStack Query mutation hooks.

Hub use cases:

- Data table screen that standardizes on TanStack Query state handling.
- Integration testing screen with mixed Convex and external query states.

Rules:

- Adapter is beta; use deliberately.
- Keep standard Convex hooks available.
- Do not wrap every Convex query through TanStack Query by default.

## 6. State Management

### 6.1 React State

Package: built into React through Next.js dependency.

Adoption decision: Required default for local component state.

What it does:

- Manages local component state.

Why it reduces work:

- No extra dependency.
- Best for state that dies with the component.

Hub use cases:

- Open or closed state for a local Dialog.
- Hovered row ID.
- Temporary tab selection when it does not need URL persistence.
- Local preview toggle.

Rules:

- Do not put server data in React state when Convex owns it.
- Do not put URL filters in React state when users need sharable URLs.
- Do not put form state in generic React state when React Hook Form owns it.

### 6.2 `nuqs`

Package: `nuqs`

Version checked: `2.8.9`

Adoption decision: Required for URL search state.

What it does:

- Manages URL search params as type-safe React state.

Why it reduces work:

- Avoids custom `URLSearchParams` parsing.
- Avoids hand-written router synchronization.
- Makes filters shareable and restorable.
- Keeps table state stable across refreshes.

How it works with ShadCN/UI:

- ShadCN Input updates search params.
- ShadCN Select updates status filters.
- ShadCN Tabs can map tab value into URL state.
- ShadCN Data Table filters can read from URL state.

How it works with Convex:

- URL state becomes Convex query arguments.
- Filter changes update the Convex query subscription.
- Server-side authorization still controls returned rows.

Hub use cases:

- Submissions Inbox filters:
  - status
  - publisher
  - property type
  - compliance flag
  - submitted date range
- Approved Properties filters:
  - visibility type
  - city
  - property status
  - platform visibility
- Audit Log filters:
  - actor
  - action
  - resource type
  - severity
  - date range
- Synchronization Monitor filters:
  - platform
  - event type
  - delivery state

Rules:

- URL state must not include secrets.
- URL state must not include raw API keys.
- URL state must not include personal data.
- Use compact keys but clear parser names.

### 6.3 `zustand`

Package: `zustand`

Version checked: `5.0.12`

Adoption decision: Conditional.

What it does:

- Provides lightweight client-side state stores.

Why it reduces work:

- Avoids prop drilling for client-only UI state.
- Avoids heavy state frameworks.
- Works well for small global UI state.

How it works with ShadCN/UI:

- Can control sidebar collapse.
- Can control command menu state.
- Can control non-sensitive workspace UI preferences.

How it works with Convex:

- It does not replace Convex.
- It must not duplicate canonical server state.
- It must not store authorization, visibility, property, submission, or sync truth.

Hub use cases:

- Admin shell sidebar collapsed state.
- Last selected non-sensitive UI density setting.
- Local command palette open state if not controlled by component state.
- Local table column display preference if not stored per user in Convex.

Rules:

- No server truth in Zustand.
- No auth state in Zustand.
- No API keys in Zustand.
- No sensitive documents in Zustand.
- No visibility decisions in Zustand.

## 7. Notifications

### 7.1 `sonner`

Package: `sonner`

Version checked: `2.0.7`

Adoption decision: Required.

What it does:

- Provides toast notifications for React.

Why it reduces work:

- Avoids building custom toast infrastructure.
- Provides consistent success, error, warning, and loading notifications.
- Works directly with ShadCN's Sonner component pattern.

How it works with ShadCN/UI:

- ShadCN has a Sonner integration.
- Use ShadCN-installed `Toaster`.
- Trigger toasts from feature-level actions.

How it works with Convex:

- Show success after mutation completes.
- Show error when mutation throws.
- Show loading toast for long actions only when the user needs feedback.
- Do not use toasts as audit records.

Hub use cases:

- Submission approved.
- Submission rejected.
- Visibility policy saved.
- Property manually hidden.
- Webhook test sent.
- API key created.
- Integration request submitted.
- Sync retry queued.

Rules:

- Toast messages must not expose raw API keys except the one-time reveal area controlled by the API key creation screen.
- Toasts must not contain personal data.
- Destructive actions require AlertDialog, not only a toast.
- Errors must be precise but not leak secrets or internal stack traces.

## 8. Animations

### 8.1 `motion`

Package: `motion`

Version checked: `12.38.0`

Adoption decision: Required for deliberate UI transitions.

What it does:

- Provides JavaScript and React animation primitives.

Why it reduces work:

- Avoids custom animation state machines.
- Handles enter, exit, layout, and small interaction transitions.

How it works with ShadCN/UI:

- Use for feature-level animated regions, not primitive replacements.
- ShadCN components already handle many primitive interactions.
- Use `motion` around composed feature shells only when state transitions need clear continuity.

How it works with Convex:

- Animate state changes caused by Convex updates sparingly.
- Do not animate rapidly updating audit streams in a distracting way.

Hub use cases:

- Review panel transition between submission sections.
- Visibility matrix row expand/collapse.
- Sync event detail drawer entrance.
- Dashboard counter transition when value updates.

Rules:

- No decorative animation.
- No animation that delays approval, rejection, suppression, or audit workflows.
- Respect reduced-motion preferences.
- Keep transitions short.

### 8.2 `tw-animate-css`

Package: `tw-animate-css`

Version checked: `1.4.0`

Adoption decision: Required with Tailwind v4 and ShadCN animations.

What it does:

- Provides Tailwind CSS v4-compatible animation utilities.

Why it reduces work:

- Avoids hand-written CSS keyframes for common ShadCN component animation states.
- Replaces older Tailwind animation plugin patterns for Tailwind v4 compatibility.

How it works with ShadCN/UI:

- Supports ShadCN component animation classes.
- Keeps Dialog, DropdownMenu, Tooltip, Sheet, Popover, and similar components consistent.

Hub use cases:

- Dialog open/close.
- DropdownMenu open/close.
- Tooltip entrance.
- Sheet entrance.
- Popover entrance.

Rules:

- Use component-provided animation classes.
- Do not create unrelated animated backgrounds.
- Do not use animation to communicate legal state without text and status indicators.

## 9. Icons

### 9.1 `lucide-react`

Package: `lucide-react`

Version checked: `1.14.0`

Adoption decision: Required.

What it does:

- Provides React icon components from the Lucide icon set.

Why it reduces work:

- Avoids drawing custom SVGs.
- Gives consistent icon sizing and stroke style.
- Works directly with ShadCN examples and Button patterns.

How it works with ShadCN/UI:

- Use inside ShadCN Button.
- Use inside DropdownMenu items.
- Use inside Tabs labels only if space allows.
- Use inside status indicators with visible text.
- Use `size={16}` or Tailwind `size-4` for normal controls.

How it works with Convex:

- Icons reflect Convex-backed state only after data is loaded.
- Do not use icons as the only representation of permission, visibility, or compliance state.

Hub use cases:

- `Inbox` for submissions.
- `Building2` for properties.
- `Eye`, `EyeOff`, or `Shield` for visibility states.
- `Plug` for integrations.
- `KeyRound` for API keys.
- `RotateCcw` for retry.
- `Check`, `X`, and `Clock` for approval states.
- `FileSearch` for audit and review.
- `AlertTriangle` for compliance flags.

Rules:

- Lucide icons only.
- No custom SVG icons unless no Lucide icon exists and the need is approved.
- Icons must have accessible labels when used without text.

## 10. Charts

### 10.1 `recharts`

Package: `recharts`

Version checked: `3.8.1`

Adoption decision: Required for dashboard charts only if charts are needed.

What it does:

- Provides React chart components.
- Supports bar, line, area, pie, radar, radial, and composed chart patterns.

Why it reduces work:

- Avoids building SVG charts from scratch.
- Works with ShadCN Chart.
- Provides tooltip, axis, grid, legend, and responsive patterns.

How it works with ShadCN/UI:

- ShadCN Chart uses Recharts v3.
- Use ShadCN `ChartContainer`, `ChartTooltip`, and `ChartTooltipContent`.
- Use Recharts primitives inside the ShadCN chart container.
- Use CSS chart tokens.

How it works with Convex:

- Convex Aggregate component should provide summary counts.
- Convex queries should return already-aggregated dashboard data.
- The browser must not compute sensitive aggregate data from raw unauthorized records.

Hub use cases:

- Dashboard submission volume by day.
- Approval decision counts.
- Visibility state distribution.
- Sync delivery success/failure counts.
- Webhook retry trend.
- Integration health summary.

Rules:

- Use charts only for operational summaries.
- Do not build analytics product scope.
- Every chart must have a table or numeric fallback nearby when precision matters.
- Do not expose hidden or sensitive records through chart drill-down unless the user has permission.

## 11. ShadCN/UI Foundation Utilities

### 11.1 `shadcn`

Package: `shadcn`

Version checked: `4.6.0`

Adoption decision: Required as CLI/source installer.

What it does:

- Adds ShadCN components to the app.
- Copies component source into the project.

Why it reduces work:

- Avoids building UI primitives from scratch.
- Gives accessible Radix-based component patterns.
- Keeps components local and adjustable without inventing primitives.

Hub usage:

- Install only required components.
- Keep all primitives in `components/ui`.
- Feature components must compose installed primitives.

Required ShadCN components for this hub:

- `button`
- `card`
- `table`
- `dialog`
- `alert-dialog`
- `badge`
- `input`
- `textarea`
- `select`
- `checkbox`
- `radio-group`
- `switch`
- `form`
- `tabs`
- `tooltip`
- `dropdown-menu`
- `popover`
- `calendar`
- `skeleton`
- `sheet`
- `separator`
- `scroll-area`
- `command`
- `sonner`
- `chart`

Rules:

- Do not edit ShadCN primitive semantics casually.
- Extend with variants only when the hub requires repeated behavior.
- Keep variants strict and named.

### 11.2 `class-variance-authority`

Package: `class-variance-authority`

Version checked: `0.7.1`

Adoption decision: Required because ShadCN components use variant patterns.

What it does:

- Defines class variants.

Why it reduces work:

- Avoids manual condition chains for component variants.
- Keeps Button, Badge, and hub status variants consistent.

Hub use cases:

- Visibility badge variants.
- Approval status badge variants.
- Sync status badge variants.
- Risk severity badge variants.

Rules:

- Use for component variants only.
- Do not encode authorization logic in variants.

### 11.3 `clsx`

Package: `clsx`

Version checked: `2.1.1`

Adoption decision: Required.

What it does:

- Builds class name strings conditionally.

Why it reduces work:

- Avoids manual string concatenation.
- Keeps conditional classes readable.

Hub use cases:

- Row state classes.
- Active filter classes.
- Pending mutation classes.
- Selected tab classes.

### 11.4 `tailwind-merge`

Package: `tailwind-merge`

Version checked: `3.5.0`

Adoption decision: Required.

What it does:

- Merges Tailwind classes and resolves conflicts.

Why it reduces work:

- Avoids class conflict bugs when composing ShadCN components.
- Supports the standard `cn()` helper pattern.

Hub use cases:

- Feature component class merging.
- Status badge class merging.
- Layout shell class merging.

Required helper:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Rules:

- Keep `cn()` in `lib/cn.ts` or `lib/utils.ts`.
- Do not duplicate `cn()` across features.

### 11.5 `next-themes`

Package: `next-themes`

Version checked: `0.4.6`

Adoption decision: Required if light/dark mode is implemented.

What it does:

- Manages theme class switching in Next.js.

Why it reduces work:

- Avoids custom theme hydration code.
- Works with ShadCN theme provider patterns.

How it works with ShadCN/UI:

- ShadCN uses CSS variables and class-based dark mode.
- `next-themes` toggles the theme class.

Hub use cases:

- Admin light/dark mode.
- Compliance review screens used for long sessions.

Rules:

- Theme is UI preference only.
- Theme must not affect exported data.
- Theme must not hide status colors or reduce contrast.

## 12. Libraries Not Recommended as Defaults

### 12.1 Heavy Grid Libraries

Do not default to:

- AG Grid
- MUI DataGrid
- PrimeReact DataTable

Reason:

- ShadCN Data Table plus TanStack Table is already the required direction.
- Heavy grids bring parallel component systems.
- Parallel component systems conflict with the ShadCN-only primitive rule.

### 12.2 Redux Toolkit

Do not default to Redux Toolkit.

Reason:

- Convex owns server state.
- React Hook Form owns form state.
- `nuqs` owns URL state.
- Zustand is enough for small client-only state if needed.

### 12.3 Formik

Do not use Formik.

Reason:

- React Hook Form plus Zod resolver is the required ShadCN-compatible pattern.

### 12.4 Custom Toast System

Do not build a custom toast system.

Reason:

- Sonner already covers required notification behavior.

### 12.5 Custom Chart Engine

Do not build chart SVGs from scratch.

Reason:

- ShadCN Chart uses Recharts v3.
- Dashboard charts are operational summaries, not a separate charting product.

## 13. Frontend Folder Structure

Required root structure under `hub/`:

```txt
hub/
  app/
    (auth)/
      sign-in/
        page.tsx
      sign-up/
        page.tsx
    (hub)/
      layout.tsx
      dashboard/
        page.tsx
      submissions/
        page.tsx
        [submissionId]/
          page.tsx
      properties/
        page.tsx
        [propertyId]/
          page.tsx
      visibility/
        page.tsx
      synchronization/
        page.tsx
      integrations/
        page.tsx
      publishers/
        page.tsx
      organizations/
        page.tsx
      audit/
        page.tsx
      settings/
        page.tsx
    api/
      auth/
        [...all]/
          route.ts
  components/
    ui/
      alert-dialog.tsx
      badge.tsx
      button.tsx
      calendar.tsx
      card.tsx
      chart.tsx
      checkbox.tsx
      command.tsx
      dialog.tsx
      dropdown-menu.tsx
      form.tsx
      input.tsx
      popover.tsx
      scroll-area.tsx
      select.tsx
      separator.tsx
      sheet.tsx
      skeleton.tsx
      sonner.tsx
      switch.tsx
      table.tsx
      tabs.tsx
      textarea.tsx
      tooltip.tsx
    layout/
      app-shell.tsx
      app-sidebar.tsx
      app-header.tsx
      breadcrumb-bar.tsx
      mobile-nav.tsx
      page-header.tsx
      permission-boundary.tsx
    feedback/
      empty-state.tsx
      error-state.tsx
      loading-state.tsx
      confirm-action-dialog.tsx
  features/
    dashboard/
      components/
        dashboard-cards.tsx
        submission-volume-chart.tsx
        sync-health-chart.tsx
        visibility-summary-chart.tsx
      hooks/
        use-dashboard-filters.ts
    submissions/
      components/
        submissions-table.tsx
        submissions-table-toolbar.tsx
        submissions-row-actions.tsx
        submission-status-badge.tsx
        submission-review-form.tsx
        submission-compliance-panel.tsx
        approval-decision-dialog.tsx
        rejection-reason-dialog.tsx
      table/
        columns.tsx
        filters.ts
      schemas/
        submission-review-form.schema.ts
    properties/
      components/
        properties-table.tsx
        property-status-badge.tsx
        property-detail-tabs.tsx
        property-identity-panel.tsx
        property-location-panel.tsx
        property-ownership-panel.tsx
        property-version-history.tsx
      table/
        columns.tsx
        filters.ts
      schemas/
        property-correction-form.schema.ts
    visibility/
      components/
        visibility-policy-form.tsx
        visibility-matrix.tsx
        visibility-status-badge.tsx
        suppression-dialog.tsx
      schemas/
        visibility-policy.schema.ts
      lib/
        visibility-display.ts
    synchronization/
      components/
        sync-events-table.tsx
        sync-event-status-badge.tsx
        webhook-delivery-attempts.tsx
        retry-sync-dialog.tsx
      table/
        columns.tsx
        filters.ts
    integrations/
      components/
        integrations-table.tsx
        integration-request-form.tsx
        webhook-url-form.tsx
        api-key-create-dialog.tsx
        api-key-one-time-reveal.tsx
        integration-status-badge.tsx
      schemas/
        integration-request.schema.ts
        webhook-url.schema.ts
        api-key-create.schema.ts
    publishers/
      components/
        publishers-table.tsx
        publisher-profile-form.tsx
        publisher-status-badge.tsx
      schemas/
        publisher-profile.schema.ts
    organizations/
      components/
        organization-members-table.tsx
        organization-role-select.tsx
        organization-type-badge.tsx
      schemas/
        organization-member.schema.ts
    audit/
      components/
        audit-log-table.tsx
        audit-severity-badge.tsx
        audit-resource-link.tsx
      table/
        columns.tsx
        filters.ts
    settings/
      components/
        compliance-settings-form.tsx
        notification-settings-form.tsx
        security-settings-form.tsx
      schemas/
        compliance-settings.schema.ts
  lib/
    auth/
      auth-client.ts
      auth-provider.tsx
      require-session.ts
    convex/
      convex-client-provider.tsx
      convex-query-provider.tsx
    forms/
      form-errors.ts
      zod-error-map.ts
    table/
      pagination.ts
      sorting.ts
      column-visibility.ts
    url-state/
      parsers.ts
      search-param-keys.ts
    notifications/
      toast-copy.ts
    formatting/
      date.ts
      number.ts
      status.ts
    icons/
      icon-map.ts
    cn.ts
  providers/
    app-providers.tsx
    theme-provider.tsx
    toaster-provider.tsx
  styles/
    globals.css
  tests/
    frontend/
      forms/
      tables/
      url-state/
      components/
```

## 14. Folder Rules

### 14.1 `components/ui`

Purpose:

- ShadCN primitives only.

Rules:

- No domain logic.
- No Convex calls.
- No Saudi-specific rules.
- No authorization logic.
- No visibility logic.
- No synchronization logic.

### 14.2 `components/layout`

Purpose:

- Hub shell and navigation.

Rules:

- May read user/session projection.
- May show or hide navigation by permission for presentation.
- Server-side Convex functions still enforce real authorization.

### 14.3 `features`

Purpose:

- Page-specific and feature-specific UI composition.

Rules:

- Feature components compose ShadCN primitives.
- Feature tables keep columns in `table/columns.tsx`.
- Feature forms keep Zod schemas in `schemas`.
- Feature-specific display helpers can live in `lib`.
- Do not import from another feature unless the component is moved to shared components.

### 14.4 `lib`

Purpose:

- Shared frontend utilities.

Rules:

- No React components unless the folder name explicitly says provider and the file is a provider.
- No Convex domain mutations hidden in utility files.
- No authorization decisions that belong in `domains/authorization`.
- Formatting functions must be pure.

### 14.5 `providers`

Purpose:

- Top-level React providers.

Required providers:

- Convex provider.
- Better Auth client provider if required by selected setup.
- Theme provider.
- Toaster provider.
- TanStack Query provider only if `@convex-dev/react-query` or external query usage is approved.

Rules:

- Providers must be narrow.
- Do not initialize feature stores globally unless needed.

## 15. Page-to-Library Mapping

### 15.1 Dashboard

Libraries:

- Convex React for live counters.
- Recharts with ShadCN Chart for operational charts.
- Sonner for action feedback.
- Lucide React for status icons.
- date-fns for display.

Use:

- Submission volume chart.
- Sync health chart.
- Visibility state summary chart.
- Pending review cards.

Rules:

- Dashboard aggregates must come from Convex aggregate-backed queries.
- Do not compute sensitive aggregates from raw rows in the browser.

### 15.2 Submissions Inbox

Libraries:

- Convex React.
- TanStack Table.
- TanStack Virtual if row count is high.
- nuqs.
- ShadCN Table, Badge, Button, DropdownMenu, Input, Select, Skeleton.
- Lucide React.

Use:

- Real-time submissions table.
- URL-backed filters.
- Row actions for review navigation.
- Status badges.

Rules:

- Server-side query must enforce permission.
- Table row action visibility is presentation only.

### 15.3 Submission Review

Libraries:

- React Hook Form.
- Zod.
- Hookform resolvers.
- Convex React mutations.
- ShadCN Form, Tabs, Card, Dialog, AlertDialog, Badge, Button.
- Sonner.
- Motion for panel transitions if needed.

Use:

- Approval decision form.
- Rejection reason form.
- Compliance issue panel.
- Saudi property field correction form.

Rules:

- Publisher users cannot approve their own submissions.
- Approval mutation must enforce server permission.
- Destructive rejection or suppression requires AlertDialog.

### 15.4 Approved Properties

Libraries:

- Convex React.
- TanStack Table.
- nuqs.
- ShadCN Table and filters.
- Lucide React.

Use:

- Canonical properties table.
- Visibility filter.
- Property status filter.
- City and publisher filters.

Rules:

- Sold/off-market/withdrawn/expired/rejected/suspended rows must show correct visibility state.
- Marketplace hidden state must be visible to authorized admins.

### 15.5 Property Detail

Libraries:

- Convex React.
- ShadCN Tabs, Card, Badge, Table, Dialog, AlertDialog.
- React Hook Form and Zod for editable correction forms.
- Sonner.
- Motion for section changes only if needed.

Use:

- Identity tab.
- Location tab.
- Ownership and regulatory references tab.
- Visibility tab.
- Synchronization tab.
- History tab.
- Audit tab.

Rules:

- Visibility controls must call server mutations.
- UI must never compute final authority alone.
- Legal/Government visibility requires explicit permission.

### 15.6 Integrations Management

Libraries:

- React Hook Form.
- Zod.
- TanStack Table.
- Convex React.
- Sonner.
- ShadCN Dialog, AlertDialog, Table, Badge, Button, Input.
- Lucide React.

Use:

- Integration request form.
- Webhook URL validation form.
- API key creation dialog.
- One-time API key reveal component.
- Integration status table.

Rules:

- Raw API key appears once.
- API key is never placed in toast.
- Webhook test is rate-limited server-side.
- Integration authorization requires platform admin or integration security officer.

### 15.7 Audit Log

Libraries:

- Convex paginated queries.
- TanStack Table.
- TanStack Virtual.
- nuqs.
- date-fns.
- ShadCN Table, Badge, Select, Input, Skeleton.

Use:

- Large audit table.
- URL-backed filters.
- Virtual scrolling.
- Severity badges.

Rules:

- Audit rows are read-only.
- Sensitive payloads are redacted by permission.
- Export actions require server authorization.

## 16. Implementation Defaults

### 16.1 Form Defaults

- `react-hook-form` for every form.
- `zodResolver` for every form.
- ShadCN Form primitives only.
- Server mutation after submit.
- Sonner notification after result.
- Field errors displayed inline.

### 16.2 Table Defaults

- TanStack Table for every data table.
- ShadCN Table primitives only.
- URL filters through `nuqs`.
- Convex query arguments from parsed URL state.
- Server pagination for large datasets.
- Virtualization for high row counts.

### 16.3 Data Defaults

- Convex React hooks first.
- TanStack Query only when approved.
- No public HTTP caching for admin hub data.
- Static docs can be cached.

### 16.4 State Defaults

- React state for local UI state.
- React Hook Form for form state.
- `nuqs` for URL state.
- Convex for server state.
- Zustand only for approved client-only global UI state.

### 16.5 Notification Defaults

- Sonner for toasts.
- AlertDialog for destructive confirmation.
- Dialog for multi-step non-destructive flows.
- Inline FormMessage for field errors.

### 16.6 Animation Defaults

- ShadCN default animations first.
- `motion` only for feature-level transitions.
- `tw-animate-css` for Tailwind v4 animation utility compatibility.
- Reduced motion respected.

### 16.7 Chart Defaults

- Recharts through ShadCN Chart.
- Convex aggregate-backed data only.
- No raw sensitive row aggregation in the browser.

## 17. Strict Conclusion

The frontend stack should be small and controlled:

- Forms: `react-hook-form`, `@hookform/resolvers`, `zod`, `react-day-picker`, `date-fns`.
- Tables: `@tanstack/react-table`, `@tanstack/react-virtual`.
- Data: `convex` first, `@tanstack/react-query` and `@convex-dev/react-query` only when justified.
- State: React state, `nuqs`, and conditional `zustand`.
- Notifications: `sonner`.
- Animations: `motion` and `tw-animate-css`.
- Icons: `lucide-react`.
- Charts: `recharts` through ShadCN Chart.
- Foundation: `shadcn`, `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `next-themes`.

This stack reduces development work without replacing the hub's rules. Convex remains the source of reactive server state. ShadCN remains the UI primitive source. Zod remains the validation source. TanStack Table handles table behavior. React Hook Form handles form behavior. Sonner handles notifications. Recharts handles dashboard charts. No parallel component system is approved.
