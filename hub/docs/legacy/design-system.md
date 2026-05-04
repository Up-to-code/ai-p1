# Design System

## Brand Identity

The hub should feel precise, official-adjacent, operational, and serious. It must not look like a consumer listing marketplace or a marketing site. The design language should communicate registry discipline, compliance review, data flow, and Saudi market specificity.

Logo direction:

- geometric data-node mark inspired by cadastral intersections;
- bilingual-ready wordmark;
- no misuse of Saudi government emblems;
- no decorative skyline or generic house icon;
- clear space equal to mark height;
- minimum digital logo height 28px;
- never stretch, rotate, outline, or apply glow.

Voice:

- direct;
- terse;
- operational;
- compliance-aware;
- no hype language in admin workflows.

## Color Palette

Primary:

- Registry Green `#0B3D2E`
- Authority Green `#146B4D`
- Survey Gold `#D8B45A`

Secondary:

- Cadastral Blue `#1E4966`
- Deed Brown `#6B4E16`
- Slate Neutral `#4B5563`

Light neutrals:

- Background `#F8FAF9`
- Surface Band `#EEF3F1`
- Surface `#FFFFFF`
- Border `#D8E1DD`
- Muted Text `#8A9691`
- Primary Text `#111827`

Dark neutrals:

- Background `#07130F`
- Surface `#111C18`
- Elevated Surface `#17251F`
- Border `#23332D`
- Primary Text `#F8FAF9`
- Muted Text `#AAB7B1`

Status:

- Approved `#16834A`
- Visible `#027A48`
- Pending `#B7791F`
- Needs Evidence `#C05621`
- Rejected `#B42318`
- Hidden `#475467`
- Limited `#175CD3`
- Suspended `#7A271A`
- Dead Letter `#912018`

## Typography

Use Inter or equivalent Latin UI font. Add a high-quality Arabic UI font when Arabic interface support is implemented.

- Display: 32px / 40px / 700
- Page title: 28px / 36px / 700
- Section title: 20px / 28px / 650
- Panel title: 16px / 24px / 650
- Body: 14px / 22px / 400
- Table text: 13px / 20px / 400
- Caption: 12px / 18px / 500
- Mono token: 12px / 18px / 500

Letter spacing is always 0.

## Spacing

Scale:

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64

Rules:

- dense operational pages use 16-24px section gaps;
- forms use 16px field gaps;
- dashboards use 24px grid gaps;
- modals use 24px body padding.

## Radius and Elevation

Radius:

- buttons: 6px;
- inputs/selects: 6px;
- cards: 8px maximum;
- modals: 8px;
- badges: pill radius allowed.

Elevation:

- flat by default;
- borders over shadows;
- small shadow for popovers;
- medium shadow for modals only.

## Buttons

Variants:

- Primary: green background, white text.
- Secondary: white/dark surface with border.
- Destructive: red background or red-outline depending context.
- Ghost: transparent icon/text.
- Link: text-only for navigation.

Sizes:

- Small: 32px height.
- Medium: 40px height.
- Large: 48px height.

States:

- default;
- hover;
- pressed;
- focus-visible with Survey Gold outline;
- loading with spinner and disabled click;
- disabled with low contrast but readable label.

Labels:

- `Approve`
- `Reject`
- `Request Evidence`
- `Escalate`
- `Manual Hide`
- `Lift Hold`
- `Recompute Visibility`
- `Test Webhook`
- `Rotate Secret`
- `Export`

## Data Tables

Table rules:

- sticky header;
- 44px compact rows;
- 56px comfortable rows where evidence preview is present;
- sortable columns show arrow icon;
- filter button opens filter popover;
- row action menu fixed right;
- row click opens detail unless interacting with checkbox/action.

Standard states:

- Loading: skeleton rows.
- Empty: short text plus one primary next action.
- Error: message, request ID, retry button.
- Updating: subtle row shimmer or status spinner, no layout shift.

Submission table columns:

- Priority
- Submission ID
- Publisher
- Source
- Category
- Intent
- City/District
- Compliance Score
- Blocking Issues
- Duplicate Signal
- Status
- Received At
- Assignee
- Actions

Property table columns:

- Visibility
- Canonical Reference
- Title
- Category
- Intent
- City/District
- Publisher
- Price/Rent
- Lifecycle
- RER Number
- Title Deed
- Ejar
- Wafi
- Updated
- Distribution
- Actions

## Cards

Allowed uses:

- dashboard metric;
- publisher summary;
- connected platform summary;
- compliance issue summary.

Rules:

- no nested cards;
- no decorative card-heavy landing layouts;
- use border and clear heading;
- card title max 16px;
- large numbers max 28px.

## Modals

Decision modals:

- max width 560px;
- require reason for reject, suspend, manual hide, hold, lift hold;
- show downstream consequence summary.

Comparison modals:

- max width 880px;
- support side-by-side raw vs normalized/evidence.

Destructive modal buttons:

- destructive action on the right;
- cancel on the left;
- reason textarea before action.

## Badges and Status Indicators

Submission:

- Received
- Pending Review
- Needs Evidence
- Possible Duplicate
- Approved
- Rejected
- Withdrawn

Lifecycle:

- Approved
- Active
- Sold
- Leased
- Withdrawn
- Off Market
- Expired
- Suspended
- Under Dispute
- Superseded

Visibility:

- Visible
- Hidden
- Limited
- Suppressed

Delivery:

- Queued
- Delivering
- Delivered
- Failed
- Dead Letter

Every visibility badge includes a tooltip listing reasons.

## Forms

Rules:

- labels above fields;
- required text visible;
- validation below fields;
- examples for Saudi formats;
- do not rely only on color;
- group legal/registry fields separately from marketing fields.

Field groups:

- Identity;
- Registry;
- Location;
- Ownership and Rights;
- Pricing;
- Ejar;
- Wafi;
- Visibility;
- Evidence.

## Dark and Light Mode

Light mode is default for admin operations.

Dark mode:

- keep semantic colors recognizable;
- avoid pure black surfaces;
- use borders for table separation;
- ensure gold focus rings meet contrast;
- never reduce warning/rejection visibility.

## Layout

Shell:

- fixed sidebar;
- topbar with environment, search, notifications, profile;
- content max width only where reading-focused;
- operational pages use full-width data surfaces.

Navigation:

- Dashboard
- Submissions
- Properties
- Integrations
- Publishers
- Audit
- Settings

Visual hierarchy:

- page title;
- primary action row;
- filters;
- data surface;
- detail drawer/modal.

No visible marketing copy explaining how to use the app inside operational screens.

