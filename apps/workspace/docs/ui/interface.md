Ara Strict Mode – Complete UI Interface Documentation

Purpose: Defines the complete Qentrah UI interface, tokenized system design, onboarding flow, major pages, key components, states, and synchronization UX for the Qentrah Workspace.

# Interface Boundary

Qentrah is the Qentrah Workspace interface. It is a synchronization engine interface. It is not a marketplace product. It is not a CRM product. It is not a lead pipeline. It is not a deal pipeline.

The interface allows authenticated organization users to create an organization, complete onboarding, wait for platform approval, prepare draft projects, invite team members, prepare draft properties and units, configure draft integrations, and observe activity. The server-side workspace remains authoritative for validation, approval, visibility, and synchronization.

The interface must use:

- Next.js App Router pages and layouts.
- ShadCN/UI primitives only.
- Tailwind CSS token-driven styling.
- Lucide React icons only.
- Convex reactive data for live operational state.
- Better Auth Organization state for organization context.

The interface must not:

- Hardcode design values inside individual pages.
- Treat draft data as authoritative.
- Distribute data outward while the organization is pending approval.
- Hide authorization requirements behind navigation visibility only.
- Create custom Button, Card, Table, Dialog, Badge, Input, Select, Form, Tabs, Tooltip, DropdownMenu, Sheet, or Skeleton primitives.

# Design Direction

The Qentrah interface direction is clean, modern, and professional like Stripe. This means restrained visual density, precise spacing, crisp typography, low-noise surfaces, subtle borders, strong focus states, and direct operational language.

The design must not use decorative gradients, large marketing hero sections, consumer listing layouts, decorative property cards as a landing page, browsing patterns, CRM pipeline patterns, or unrequested visual features.

# Design Tokens

## Token Rule

All system styling must be token-driven. App-wide values live in CSS variables. Tailwind maps to those variables. ShadCN/UI components consume those variables. Changing one variable must change the whole app design.

No page, component, modal, table, card, banner, sidebar item, or form may hardcode:

- brand colors;
- neutral colors;
- semantic colors;
- typography sizes;
- line heights;
- letter spacing;
- spacing;
- border radius;
- shadows;
- sidebar widths;
- component heights;
- focus ring color;
- table row height.

## CSS Variable Groups

The implementation must define variables in one global token layer. The recommended ownership is `app/globals.css` for CSS variables and Tailwind theme mapping in the Tailwind configuration.

Example token groups:

```css
:root {
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-press: #1E40AF;

  --color-background: #FFFFFF;
  --color-surface: #FAFAFA;
  --color-border: #E5E5E5;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;

  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-draft: #64748B;

  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-size-h1: 32px;
  --font-size-h1-compact: 28px;
  --font-size-h2: 24px;
  --font-size-h3: 20px;
  --font-size-body-lg: 16px;
  --font-size-body: 14px;
  --font-size-caption: 12px;
  --font-size-caption-lg: 13px;
  --line-height-default: 1.5;
  --line-height-comfortable: 1.6;
  --letter-spacing-heading: -0.02em;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  --radius-control: 8px;
  --radius-control-sm: 6px;
  --radius-card: 12px;
  --radius-modal: 12px;
  --radius-container: 16px;
  --radius-pill: 9999px;

  --shadow-card: 0 1px 2px rgb(15 23 42 / 0.06);
  --shadow-popover: 0 8px 24px rgb(15 23 42 / 0.10);
  --shadow-modal: 0 20px 48px rgb(15 23 42 / 0.18);

  --sidebar-width-expanded: 280px;
  --sidebar-width-collapsed: 64px;
  --top-banner-height: 44px;
  --topbar-height: 64px;
  --button-height-md: 40px;
  --button-height-lg: 44px;
  --input-height: 40px;
  --table-row-height: 48px;
}

.dark {
  --color-background: #0A0A0A;
  --color-surface: #111111;
  --color-border: #27272A;
  --color-text-primary: #F4F4F5;
  --color-text-secondary: #A1A1AA;
  --color-text-muted: #71717A;
}
```

## Required Color Defaults

| Token | Light Value | Dark Value | Usage |
| --- | --- | --- | --- |
| `--color-primary` | `#2563EB` | `#2563EB` | Primary actions, active navigation, focus accents. |
| `--color-primary-hover` | `#1D4ED8` | `#1D4ED8` | Primary hover state. |
| `--color-primary-press` | `#1E40AF` | `#1E40AF` | Primary pressed state. |
| `--color-background` | `#FFFFFF` | `#0A0A0A` | App page background. |
| `--color-surface` | `#FAFAFA` | `#111111` | Cards, panels, tables, sidebar. |
| `--color-border` | `#E5E5E5` | `#27272A` | Borders and dividers. |
| `--color-text-primary` | `#0F172A` | `#F4F4F5` | Main text. |
| `--color-text-secondary` | `#64748B` | `#A1A1AA` | Secondary text. |
| `--color-text-muted` | `#94A3B8` | `#71717A` | Captions and metadata. |
| `--color-success` | `#22C55E` | `#22C55E` | Approved, active, synced. |
| `--color-warning` | `#F59E0B` | `#F59E0B` | Pending, review, warning. |
| `--color-danger` | `#EF4444` | `#EF4444` | Rejected, destructive, failed. |
| `--color-draft` | `#64748B` | `#A1A1AA` | Draft status. |

## Typography Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--font-sans` | Inter, Geist, Satoshi, system sans-serif fallback | Entire UI. |
| `--font-size-h1` | `32px` | Standard page title. |
| `--font-size-h1-compact` | `28px` | Dense admin page title. |
| `--font-size-h2` | `24px` | Section title. |
| `--font-size-h3` | `20px` | Card group title. |
| `--font-size-body-lg` | `16px` | Prominent body text. |
| `--font-size-body` | `14px` | Base UI text. |
| `--font-size-caption` | `12px` | Captions, badges, metadata. |
| `--font-size-caption-lg` | `13px` | Table metadata and dense labels. |
| `--line-height-default` | `1.5` | Standard text. |
| `--line-height-comfortable` | `1.6` | Longer helper copy. |
| `--letter-spacing-heading` | `-0.02em` | Headings only. |

Headings must use semibold weight. Body text must use regular weight. Button labels and badges must use medium weight. Table header labels must use medium weight with muted text.

## Spacing Tokens

Use an 8px-based spacing scale with explicit 4px support:

| Token | Value | Usage |
| --- | --- | --- |
| `--space-1` | `4px` | Tiny gaps, icon-label gap in dense controls. |
| `--space-2` | `8px` | Control gaps, badge padding. |
| `--space-3` | `12px` | Compact card padding, table cell horizontal padding. |
| `--space-4` | `16px` | Form field gaps, page header inner gaps. |
| `--space-5` | `20px` | Medium panel gaps. |
| `--space-6` | `24px` | Card padding and page section gaps. |
| `--space-8` | `32px` | Large section gaps. |
| `--space-10` | `40px` | Setup wizard vertical spacing. |
| `--space-12` | `48px` | Empty state spacing. |
| `--space-16` | `64px` | Main layout breathing room on large screens. |
| `--space-20` | `80px` | Rare page-level separation. |

## Radius Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-control-sm` | `6px` | Compact buttons, compact inputs, small badges. |
| `--radius-control` | `8px` | Standard buttons, inputs, selects. |
| `--radius-card` | `12px` | Cards and panels. |
| `--radius-modal` | `12px` | Dialog content. |
| `--radius-container` | `16px` | Large containers. |
| `--radius-pill` | `9999px` | Pills and tags. |

## Shadow Tokens

The interface must be almost flat. Borders are preferred over heavy elevation.

| Token | Value | Usage |
| --- | --- | --- |
| `--shadow-card` | `0 1px 2px rgb(15 23 42 / 0.06)` | Cards that need slight separation. |
| `--shadow-popover` | `0 8px 24px rgb(15 23 42 / 0.10)` | DropdownMenu, Tooltip, Select content. |
| `--shadow-modal` | `0 20px 48px rgb(15 23 42 / 0.18)` | Dialog and AlertDialog. |

## Component Size Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--sidebar-width-expanded` | `280px` | Expanded desktop sidebar. |
| `--sidebar-width-collapsed` | `64px` | Collapsed desktop sidebar. |
| `--top-banner-height` | `44px` | Pending approval banner. |
| `--topbar-height` | `64px` | Organization context topbar. |
| `--button-height-md` | `40px` | Default button height. |
| `--button-height-lg` | `44px` | Primary page action button height. |
| `--input-height` | `40px` | Input and select trigger height. |
| `--table-row-height` | `48px` | Default table row height. |

# Overall Layout

## Shell Structure

The authenticated application shell has four regions:

1. Left sidebar.
2. Fixed top pending approval banner when required.
3. Topbar with organization context and user menu.
4. Main content region.

Desktop layout:

- Sidebar is fixed left.
- Sidebar width is `--sidebar-width-expanded` when expanded.
- Sidebar width is `--sidebar-width-collapsed` when collapsed.
- Topbar starts after the sidebar.
- Main content starts below topbar and below the pending approval banner if banner exists.
- Main content max width is not globally capped. Operational pages use full available width.
- Page content uses `--space-6` padding on desktop and `--space-4` padding on tablet.

Mobile layout:

- Sidebar becomes a ShadCN Sheet.
- Menu trigger appears in the topbar left.
- Sheet width is `min(320px, 88vw)`.
- Pending approval banner remains fixed at top and wraps text only if required.

## Topbar

The topbar height is `--topbar-height`.

Topbar left:

- Mobile sidebar trigger.
- Page breadcrumb on desktop when the page is nested.
- Current organization name.

Topbar right:

- Organization status badge.
- Real-time synchronization indicator.
- Notifications trigger.
- User menu.

The real-time synchronization indicator shows:

- `Live` when Convex data is connected and fresh.
- `Reconnecting` when reactive state is stale.
- `Sync blocked` when organization is pending approval.
- `Sync failed` when the latest distribution job failed.

# Sidebar

## Menu Order

The sidebar menu is grouped by operating work first, then administration.

Operations:

1. Dashboard.
2. Projects.
3. Units.
4. Clients.

Administration:

1. Organization.
2. Integrations.
3. UI Components.
4. Activity Log.

No other menu item may be inserted without updating this document.

## Menu Item Specifications

| Item | Icon | Route | Purpose |
| --- | --- | --- | --- |
| Dashboard | `LayoutDashboard` | `/dashboard` | Organization overview, approval state, draft counts, synchronization health. |
| Projects | `Building2` | `/projects` | Project records owned by the current organization. |
| Units | `House` | `/properties` | Unit inventory connected to projects. |
| Clients | `UserRound` | `/clients` | Client profiles with budget, nationality, age, generation, property interest, and issue tracking. |
| Organization | `Landmark` | `/organization` | Active organization profile, organization.read context, members, approval flight, and settings. |
| Integrations | `Plug` | `/integrations` | Connected platforms, OAuth clients, webhook endpoints, trusted URLs. |
| UI Components | `PanelsTopLeft` | `/components` | Reusable selectors, inputs, badges, loading progress, upload controls, chat UI, and notification toasts. |
| Activity Log | `History` | `/activity` | Immutable organization activity and synchronization events. |

## Expanded State

Expanded sidebar:

- Width: `--sidebar-width-expanded`.
- Shows Qentrah wordmark.
- Shows current organization name.
- Shows organization status badge.
- Shows full menu labels.
- Shows collapse button at bottom or header trailing edge.

Menu item layout:

- Height: 40px.
- Icon size: 18px.
- Gap: `--space-3`.
- Horizontal padding: `--space-3`.
- Radius: `--radius-control`.

## Collapsed State

Collapsed sidebar:

- Width: `--sidebar-width-collapsed`.
- Shows compact Qentrah mark only.
- Hides organization name.
- Shows icons only.
- Shows ShadCN Tooltip on hover/focus for each menu item.
- Preserves active state with primary background.

Collapsed item behavior:

- Icon remains centered.
- Tooltip label matches full menu label exactly.
- Keyboard focus opens tooltip.
- Active icon uses primary foreground contrast.

## Active State

The active sidebar item:

- Uses `--color-primary` background.
- Uses white text.
- Uses `--radius-control`.
- Uses the same active state in expanded and collapsed modes.
- Must not rely on color alone; active item also uses `aria-current="page"`.

## Hover State

Inactive hover:

- Uses surface contrast background.
- Text remains `--color-text-primary`.
- Icon remains readable.

Disabled hover:

- No background change.
- Cursor remains default or not-allowed depending component constraints.
- Tooltip explains the unavailable state.

## Disabled State

Disabled sidebar items are allowed only when a route cannot be used until prerequisite state exists.

Examples:

- Before organization creation, all app menu items are unavailable because the user is forced into organization creation.
- During setup wizard, sidebar is hidden or disabled because the user must complete onboarding.

Pending approval does not disable My Projects or Team Members. Pending approval limits synchronization, not navigation.

# Post-Login Flow

## Flow Order

After login:

1. Query current user organizations.
2. If no organization exists, route user to forced organization creation.
3. After organization creation, route user to setup wizard.
4. After all wizard steps are submitted, set organization status to `pending_approval`.
5. Route user to Dashboard.
6. Show fixed pending approval banner.
7. Allow draft projects and draft team members.
8. Block outward synchronization until organization is approved.

## Create Organization Screen

This screen is not optional when the user has no organization.

Layout:

- Centered form panel.
- Max width: 480px.
- Page background: `--color-background`.
- Panel background: `--color-surface`.
- Panel radius: `--radius-card`.
- Panel padding: `--space-6`.

Fields:

| Field | Component | Required | Validation |
| --- | --- | --- | --- |
| Organization name | ShadCN Input | Yes | 2-120 characters. |
| Organization type | ShadCN Select | Yes | Must be one allowed type. |

Allowed organization types:

- Publisher / Developer.
- Integration Partner.
- Internal Workspace.
- Legal / Government Observer.

Buttons:

| Button | Variant | Behavior |
| --- | --- | --- |
| Create Organization | Primary | Validates fields, creates organization, routes to setup wizard. |
| Sign Out | Ghost | Signs out and returns to login. |

States:

- Loading: show Skeleton panel until session and organization query resolve.
- Empty: this screen is the empty organization state.
- Validation error: inline error under field.
- Server error: Alert above submit button with retry instruction.
- Saving: submit button disabled, spinner visible, no duplicate submit.

# Setup Wizard

## Wizard Layout

The setup wizard is mandatory after organization creation.

Layout:

- Page shell without normal sidebar navigation, or sidebar disabled.
- Centered wizard container with max width 960px.
- Stepper at top.
- Main form card below stepper.
- Footer actions fixed to bottom of card.

Stepper:

- Four steps.
- Current step uses primary.
- Completed step uses success.
- Incomplete step uses muted.
- Step labels:
  1. Company Information.
  2. Legal Documentation.
  3. Logo & Brand.
  4. Invite Team Members.

Common buttons:

| Button | Step | Variant | Behavior |
| --- | --- | --- | --- |
| Back | Steps 2-4 | Secondary | Returns to previous step without losing saved data. |
| Save Draft | All steps | Secondary | Saves current valid fields; invalid optional fields may be omitted. |
| Continue | Steps 1-3 | Primary | Validates current step and advances. |
| Submit for Review | Step 4 | Primary | Validates required onboarding state and sets organization to `pending_approval`. |
| Skip Invites | Step 4 only | Ghost | Allows finishing without invited users. |

## Step 1: Company Information

Purpose: Capture operational organization identity.

Fields:

| Field | Component | Required | Validation |
| --- | --- | --- | --- |
| Legal company name | Input | Yes | 2-160 characters. |
| Display name | Input | Yes | 2-80 characters. |
| Commercial registration number | Input | Yes | Numeric or approved registration format. |
| VAT / tax identifier | Input | No | Optional approved tax format. |
| Primary contact name | Input | Yes | 2-120 characters. |
| Primary contact email | Input | Yes | Valid email. |
| Primary contact phone | Input | Yes | Phone format preferred. |
| Website | Input | No | Valid HTTPS URL if provided. |
| Headquarters city | Select | Yes | Allowed city option. |
| Operating regions | Multi-select | Yes | At least one region. |

Actions:

- Save Draft stores step data without submitting organization for review.
- Continue validates required fields and advances to Legal Documentation.

States:

- Loading: skeleton fields.
- Empty: blank form.
- Draft: saved timestamp appears under step title.
- Error: inline field errors and top-level server error if save fails.

Synchronization connection:

- Company data is organization metadata only.
- It does not create synchronization eligibility.
- Organization remains non-authoritative until platform approval.

## Step 2: Legal Documentation

Purpose: Capture legal evidence required for organization approval.

Fields and uploads:

| Field | Component | Required | Validation |
| --- | --- | --- | --- |
| Commercial registration document | File upload | Yes | PDF, PNG, or JPG; size limit defined by backend. |
| Authorization letter | File upload | Yes | PDF, PNG, or JPG; must be readable. |
| Authorized signer name | Input | Yes | 2-120 characters. |
| Authorized signer title | Input | Yes | 2-120 characters. |
| Document accuracy confirmation | Checkbox | Yes | Must be checked. |

Upload behavior:

- Upload area uses Card + Input composition.
- Uploaded file row shows file name, size, upload status, and remove action.
- Replace action opens file picker.
- Remove action uses AlertDialog if file is already uploaded.

Document statuses:

- `not_uploaded`.
- `uploading`.
- `uploaded`.
- `failed`.
- `requires_replacement`.

Actions:

- Back returns to Company Information.
- Save Draft saves uploaded file references and entered fields.
- Continue requires all required documents and confirmation.

Synchronization connection:

- Missing legal documentation blocks organization approval.
- Pending organization can create draft records, but no distribution occurs.

## Step 3: Logo & Brand

Purpose: Capture basic organization display identity.

Fields:

| Field | Component | Required | Validation |
| --- | --- | --- | --- |
| Logo | File upload | No | PNG, JPG, or SVG if allowed by security policy. |
| Brand display name | Input | Yes | Defaults from Step 1 display name. |
| Brand color | Color input or Select preset | No | Valid hex color. |

Preview:

- Card preview shows logo, display name, status badge, and sample project row.
- Preview uses tokens. It must not create hardcoded color exceptions.

Actions:

- Back returns to Legal Documentation.
- Save Draft saves brand fields.
- Continue validates brand color if provided and advances.

Synchronization connection:

- Brand data can be used in admin display and developer portal references.
- Brand data does not change canonical property synchronization rules.

## Step 4: Invite Team Members

Purpose: Allow the organization owner to invite initial collaborators.

Fields:

| Field | Component | Required | Validation |
| --- | --- | --- | --- |
| Email address | Input | No | Required only when adding an invite row. |
| Role | Select | No | Required only when adding an invite row. |

Allowed roles:

- Organization Owner.
- Organization Admin.
- Project Editor.
- Viewer.

Invite table columns:

| Column | Description |
| --- | --- |
| Email | Invited email address. |
| Role | Selected organization role. |
| Status | Draft invite or sent invite. |
| Actions | Remove draft invite. |

Actions:

| Button | Behavior |
| --- | --- |
| Add Invite | Validates email and role, adds row to pending invite list. |
| Remove | Removes unsent invite row. |
| Skip Invites | Completes wizard without team invites. |
| Submit for Review | Sends valid invites if present, marks setup complete, sets organization to `pending_approval`. |

Synchronization connection:

- Team invites do not affect property synchronization.
- Invited users can access draft organization work only after accepting and passing authorization checks.

# Pending Approval Banner

## Text

The banner text is exact:

`Your organization is under review. We will notify you when approved.`

## Placement

- Fixed at the top of the authenticated shell.
- Height: `--top-banner-height`.
- Appears above topbar.
- Main content must offset by banner height when visible.
- Sidebar height also starts below banner or visually aligns with fixed banner depending shell implementation.

## Visual Design

- Background uses warning tint derived from `--color-warning`.
- Border bottom uses `--color-border`.
- Text uses readable warning foreground.
- Icon: `Clock` or `Info` from Lucide React.
- Font size: `--font-size-body`.
- No close button. Banner persists until organization approval state changes.

## Behavior

- Visible only when organization status is `pending_approval`.
- Does not block navigation.
- Does not block draft creation.
- Blocks outward synchronization by communicating the state, not by owning server logic.

# Dashboard

## Shared Layout

Page header:

- Title: `Dashboard`.
- Subtitle: organization name and current organization status.
- Right action area: context actions allowed for current status.

Body:

- Top status section.
- Metrics grid.
- Quick actions.
- Recent activity.
- Synchronization panel.

## Pending State Dashboard

Shown when organization status is `pending_approval`.

Sections:

| Section | Layout | Content |
| --- | --- | --- |
| Approval status panel | Full-width Card | Pending review title, submitted timestamp, expected notification copy, blocked sync note. |
| Draft work metrics | Three Card grid | Draft projects, draft properties/units, pending team invites. |
| Quick actions | Card | Add Project, Invite Team Member. |
| Synchronization status | Card | `Sync blocked until organization approval`. |
| Recent activity | Table/Card | Latest draft and organization events. |

Allowed quick actions:

- Add Project.
- Invite Team Member.
- View Activity Log.

Blocked actions:

- Activate integration.
- Publish properties.
- Trigger outbound synchronization.

Synchronization connection:

- Dashboard must show that draft work is stored internally.
- Dashboard must show that no outbound distribution happens before approval.

## Approved State Dashboard

Shown when organization status is `approved`.

Sections:

| Section | Layout | Content |
| --- | --- | --- |
| Sync health | Card | Overall sync state, last successful sync, failed events. |
| Project metrics | Card grid | Active projects, draft projects, archived projects if applicable. |
| Property metrics | Card grid | Approved properties/units, draft claims, hidden records. |
| Integration metrics | Card grid | Connected platforms, live webhooks, failed deliveries. |
| Quick actions | Button row | Add Project, Add Property / Unit, Configure Integration. |
| Recent activity | Data table | Recent approval, sync, visibility, and integration events. |

Synchronization connection:

- Approved organization state allows eligible records to enter validation, approval, visibility evaluation, and synchronization.
- Dashboard still shows failed sync states and does not hide operational errors.

# My Projects Page

## Purpose

The My Projects page manages project records owned by the current organization.

## Layout

- Page header with title `My Projects`.
- Subtitle explains project draft/approval state in one sentence.
- Primary action: `Add Project`.
- Filter row below header.
- Data table as default view.
- Optional card grid only for small screens.

## Filters

| Filter | Component | Options |
| --- | --- | --- |
| Status | Select | All, Draft, Pending Review, Approved, Rejected. |
| City | Select | City list. |
| Type | Select | Residential, Commercial, Mixed Use, Land, Other allowed project types. |
| Search | Input | Project name, reference, city. |

## Table Columns

| Column | Description |
| --- | --- |
| Project | Project name and internal reference. |
| City / District | Location summary. |
| Type | Project category. |
| Status | Draft, Pending Review, Approved, Rejected. |
| Properties / Units | Count linked records. |
| Sync State | Draft, Blocked, Eligible, Synced, Failed. |
| Updated | Last updated timestamp. |
| Actions | DropdownMenu. |

## Row Actions

| Action | Behavior |
| --- | --- |
| View Details | Opens project detail route or drawer. |
| Edit | Opens edit Dialog when user has permission. |
| Add Property / Unit | Opens property/unit creation flow scoped to project. |
| Submit for Review | Available only for valid draft project when organization is approved. |
| Archive Draft | AlertDialog confirmation for draft project removal/archive. |

## Add Project Modal

Component: ShadCN Dialog.

Fields:

- Project name.
- Project type.
- City.
- District.
- Description.
- Internal reference.

Buttons:

- Cancel.
- Save Draft.

States:

- Loading: submit button spinner.
- Empty: blank fields.
- Draft: new project saved as `draft`.
- Error: inline errors and server error alert.

Synchronization connection:

- Pending organization: saved project remains `draft` and sync state is `blocked`.
- Approved organization: draft project may become eligible for review, but it is not synchronized until approved by required workflow.

# Properties / Units Page

## Purpose

The Properties / Units page manages property and unit claims submitted or entered by the organization.

## Layout

- Page header with title `Properties / Units`.
- Primary action: `Add Property / Unit`.
- Secondary action: `Import Drafts` only if integration/import feature exists in implementation scope.
- Filter bar.
- Data table default.
- Property card grid for narrow viewports.

## Filters

| Filter | Component | Options |
| --- | --- | --- |
| Project | Select | All projects and current organization projects. |
| Status | Select | All, Draft, Pending Review, Approved, Rejected. |
| Visibility | Select | All, Visible, Hidden, Sync Blocked. |
| Sync State | Select | All, Draft, Blocked, Eligible, Synced, Failed. |
| Search | Input | Property label, unit number, reference, city, district. |

## Table Columns

| Column | Description |
| --- | --- |
| Property / Unit | Label, unit number, internal reference. |
| Project | Linked project name. |
| Location | City and district. |
| Type | Property or unit type. |
| Status | Draft, Pending Review, Approved, Rejected. |
| Visibility | Visible, Hidden, Suppressed, Blocked. |
| Sync State | Draft, Blocked, Eligible, Synced, Failed. |
| Updated | Last update timestamp. |
| Actions | DropdownMenu. |

## Row Actions

| Action | Behavior |
| --- | --- |
| View | Opens property detail. |
| Edit Draft | Opens edit Dialog for draft records. |
| Duplicate Draft | Creates a new draft using selected record as source if allowed. |
| Submit Claim | Available when organization is approved and draft is valid. |
| Delete Draft | AlertDialog confirmation. |

## Add/Edit Property Modal

Component: ShadCN Dialog.

Required fields:

- Project.
- Property / unit label.
- Property type.
- City.
- District.
- Address summary.
- Internal reference.

Optional fields:

- Unit number.
- Floor.
- Area.
- Bedrooms.
- Bathrooms.
- Price or rent amount.
- Notes.

Buttons:

- Cancel.
- Save Draft.
- Submit Claim only when organization is approved and required validation passes.

Synchronization connection:

- Property records are claims until approved.
- Pending organization records remain draft and do not distribute outward.
- Approved organization records can enter validation and approval.
- Visibility evaluation remains server-side and authoritative.

# Team Members Page

## Purpose

The Team Members page manages organization members and invitations.

## Layout

- Page header title `Team Members`.
- Primary action: `Invite Team Member`.
- Member table.
- Pending invites section.

## Member Table Columns

| Column | Description |
| --- | --- |
| Name | Member name or email fallback. |
| Email | Member email. |
| Role | Organization role. |
| Status | Active, Pending, Disabled. |
| Last Active | Last activity timestamp. |
| Actions | DropdownMenu. |

## Pending Invite Columns

| Column | Description |
| --- | --- |
| Email | Invited email address. |
| Role | Invited role. |
| Invited By | Inviting user. |
| Sent At | Invite timestamp. |
| Status | Pending, Expired, Revoked. |
| Actions | Resend or Revoke. |

## Invite Modal

Component: ShadCN Dialog.

Fields:

- Email address.
- Role.

Buttons:

- Cancel.
- Send Invite.

States:

- Loading: member and invite skeleton rows.
- Empty: no team members beyond owner; show `Invite Team Member`.
- Draft: invite row pending send or pending acceptance.
- Approved: normal invite behavior.
- Error: duplicate invite, invalid email, permission denied.

Synchronization connection:

- Team members affect who can create, edit, approve, or view draft data.
- Team member changes do not directly synchronize property data outward.

# Integrations Page

## Purpose

The Integrations page manages connected platforms, OAuth clients, API credentials, trusted URLs, and webhook endpoints for the organization.

## Layout

- Page header title `Integrations`.
- Primary action: `Add Integration`.
- Integration readiness panel.
- Connected platforms table.
- Webhook endpoints table.

## Connected Platforms Table Columns

| Column | Description |
| --- | --- |
| Platform | Platform name and type. |
| Mode | Draft, Sandbox, Production. |
| Trusted URLs | Verified, Missing, Rejected. |
| Credentials | Client ID issued, API key issued, secret rotation due. |
| Webhooks | Configured, Not configured, Failing. |
| Sync State | Not live, Live, Blocked, Failed. |
| Updated | Last updated timestamp. |
| Actions | DropdownMenu. |

## Actions

| Action | Behavior |
| --- | --- |
| Add Integration | Opens Dialog for integration draft. |
| Edit Trusted URLs | Opens Dialog to manage allowed origins and redirect URIs. |
| Test Webhook | Opens Dialog and sends test event when allowed. |
| Rotate Secret | AlertDialog confirmation before secret rotation. |
| Disable Integration | AlertDialog confirmation. |

Pending organization behavior:

- Integrations can be drafted.
- Trusted URLs can be entered for review.
- Webhook tests may be blocked or sandbox-only depending backend policy.
- Production activation is blocked.

Synchronization connection:

- Integrations define outward distribution targets.
- Pending organization keeps integrations `not_live`.
- Approved organization can activate integrations only after credentials, trusted URLs, and platform authorization pass.

# Activity Log Page

## Purpose

The Activity Log page displays immutable organization activity, including draft changes, organization review events, synchronization events, integration events, visibility events, and team events.

## Layout

- Page header title `Activity Log`.
- Filter row.
- Data table.
- Event detail drawer using ShadCN Sheet.

## Filters

| Filter | Options |
| --- | --- |
| Event Type | All, Organization, Project, Property, Team, Integration, Synchronization, Visibility. |
| Actor | Current user, system, team member. |
| Date Range | Today, 7 days, 30 days, custom. |
| Severity | Info, Warning, Error. |

## Table Columns

| Column | Description |
| --- | --- |
| Time | Event timestamp. |
| Event | Human-readable event label. |
| Actor | User or system actor. |
| Resource | Project, property, integration, organization, or user. |
| Severity | Info, Warning, Error. |
| Sync Impact | None, Draft only, Blocked, Distributed, Failed. |
| Actions | View details. |

## Event Detail Drawer

Shows:

- Event ID.
- Timestamp.
- Actor.
- Resource.
- Before/after summary when allowed.
- Request ID.
- Synchronization impact.

Synchronization connection:

- Activity log is the visible audit surface for synchronization state changes.
- It must show when sync is blocked due to pending approval.
- It must show failed webhook or distribution events when authorized.

# Key Components

## Data Tables

Use ShadCN Table composition.

Required features:

- Sticky header.
- Hover rows.
- Sortable headers where sorting exists.
- Filter bar above table.
- Row action DropdownMenu.
- Bulk selection only when bulk action is explicitly supported.
- Skeleton rows during loading.
- Empty state row when no data exists.
- Error state panel when query fails.

Bulk actions:

- Must be hidden when no selected row supports the action.
- Must use AlertDialog for destructive actions.
- Must never bypass server authorization.

## Property Cards

Used on narrow viewports or card view.

Card content:

- Property / unit label.
- Project name.
- City and district.
- Property type.
- Status badge.
- Draft indicator.
- Visibility badge.
- Sync badge.
- Updated timestamp.
- Primary action.

Card actions:

- View.
- Edit Draft.
- Submit Claim when allowed.

## Status Badges

Use ShadCN Badge.

Required statuses:

| Status | Color Token | Meaning |
| --- | --- | --- |
| Draft | `--color-draft` | Stored internally, not synchronized outward. |
| Pending Approval | `--color-warning` | Organization or record is under review. |
| Approved | `--color-success` | Approved by required workflow. |
| Rejected | `--color-danger` | Rejected by review workflow. |
| Synced | `--color-success` | Distributed successfully. |
| Sync Blocked | `--color-warning` | Synchronization blocked by state or policy. |
| Visible | `--color-success` | Visible for an authorized channel. |
| Hidden | `--color-draft` | Not visible for the channel. |

## Draft Indicators

Draft indicators must appear anywhere draft data could be mistaken for authoritative data.

Required draft indicator locations:

- Organization status area.
- Dashboard metric cards.
- Project rows.
- Property rows.
- Property cards.
- Integration rows.
- Pending invite rows.

Draft wording:

- `Draft`.
- `Draft - not synchronized`.
- `Blocked until organization approval`.

## Modals

Use ShadCN Dialog for:

- Create organization.
- Add project.
- Edit project.
- Add property / unit.
- Edit property / unit.
- Invite team member.
- Add integration.
- Edit trusted URLs.
- Test webhook.

Use ShadCN AlertDialog for:

- Delete draft.
- Archive project.
- Revoke invite.
- Rotate secret.
- Disable integration.

Modal rules:

- Title must state the action.
- Description must state the effect.
- Primary button must match action.
- Destructive action must require confirmation.
- Loading state must disable submit and cancel if cancellation would corrupt state.

## Forms

Use ShadCN Form with Zod validation expectations.

Form rules:

- Required fields are visually marked.
- Inline errors appear directly below fields.
- Server errors appear above the action row.
- Submit buttons show loading spinner.
- Duplicate submissions are blocked while saving.
- Form values are preserved after validation errors.

## Empty States

Each empty state must contain:

- Icon from Lucide React.
- Direct title.
- One sentence explaining the state.
- One primary action if the user has permission.

Required empty states:

| Page | Empty Title | Primary Action |
| --- | --- | --- |
| Dashboard pending drafts | `No draft work yet` | `Add Project` |
| My Projects | `No projects yet` | `Add Project` |
| Properties / Units | `No properties or units yet` | `Add Property / Unit` |
| Team Members | `No invited team members` | `Invite Team Member` |
| Integrations | `No integrations configured` | `Add Integration` |
| Activity Log | `No activity yet` | No primary action. |

## Loading States

Loading rules:

- Preserve final layout dimensions.
- Use Skeleton for cards, tables, and form blocks.
- Use button spinner for save actions.
- Do not show empty state until loading completes.
- Do not show stale approved state while organization status is loading.

# State Management

## Loading State

The UI shows Skeleton components while Convex queries, Better Auth session, or organization context are loading.

Loading state must not:

- Flash unauthorized routes.
- Flash approved dashboard before organization status loads.
- Show empty state prematurely.

## Empty State

Empty state appears only after loading completes and the query returns no records.

Empty state must show one next action only, unless the user lacks permission.

## Draft State

Draft means the record is stored but not authoritative.

Draft records:

- Are editable.
- Are visible internally to authorized organization users.
- Are excluded from outbound synchronization.
- Are marked with draft indicators.

## Pending Approval State

Pending approval means the organization is under platform review.

Pending organization users can:

- View Dashboard.
- Add draft projects.
- Invite team members.
- View Activity Log.
- Draft integrations if allowed.

Pending organization users cannot:

- Activate production integrations.
- Publish records outward.
- Trigger outbound synchronization.
- Treat records as authoritative.

## Approved State

Approved means the organization passed platform review.

Approved organizations can:

- Submit valid draft projects or property claims for required review.
- Configure eligible integrations.
- Enter synchronization workflows when records and integrations pass policy.

Approved does not mean every record is visible or synchronized. Each record still requires its own validation, approval, visibility evaluation, and distribution eligibility.

## Error State

Error state must show:

- Short plain-language message.
- Retry action when retry is safe.
- Request ID when available.
- No raw server stack traces.
- No secrets, tokens, personal data, or raw webhook payloads.

# UX Patterns

## Real-Time Sync Status

Real-time sync status appears in:

- Topbar.
- Dashboard sync health card.
- Properties / Units table.
- Integrations table.
- Activity Log.

Status labels:

- `Live`.
- `Reconnecting`.
- `Draft`.
- `Sync blocked`.
- `Sync eligible`.
- `Synced`.
- `Sync failed`.

## Notifications

Notifications use ShadCN-compatible toast behavior if available in the implementation.

Notification types:

- Success after draft save.
- Warning when sync remains blocked.
- Error when save fails.
- Info when organization status changes.

Notifications must not reveal secrets or raw personal data.

## Synchronization Authority

The UI never computes authoritative synchronization decisions. The UI displays server-computed state.

Server-owned decisions:

- Organization approval.
- Record approval.
- Visibility evaluation.
- Outbound synchronization eligibility.
- Integration activation.
- Webhook retry state.

UI-owned behavior:

- Layout.
- Form presentation.
- Loading state.
- Empty state.
- Disabled button state based on server-provided permissions.
- User confirmation for actions.

## Pending Organization Sync Lock

When organization status is `pending_approval`:

- Projects saved from UI are `draft`.
- Properties / units saved from UI are `draft`.
- Integrations saved from UI are `draft` or `not_live`.
- Team invites may be created.
- Outbound synchronization is blocked.
- Dashboard, tables, cards, badges, and activity events must reflect the block.

## Approved Organization Sync Path

When organization status is `approved`:

1. User creates or edits a draft record.
2. User submits valid record for review if required.
3. Server validates the claim.
4. Server approves or rejects.
5. Server computes visibility.
6. Server creates synchronization jobs.
7. UI displays sync status from Convex reactive data.

The UI does not skip approval or visibility evaluation.
