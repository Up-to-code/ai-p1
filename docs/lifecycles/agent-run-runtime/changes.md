# Changes

## 2026-06-06 Creator-Private Agent Threads

- Made Workspace Agent threads creator-private within each organization: thread list, message reads, context reads, and chat continuation now require the authenticated user to match `agentThreads.createdByUserId`.
- Added hard deletion for user-owned Agent threads through the organization API, cascading messages, runs, run steps, tool calls, confirmations, memory summaries, and memory facts while rejecting deletion during running runs.
- Added sidebar and thread history delete controls that confirm before deletion, clear the active `threadId` URL when needed, and rely on Convex thread queries as the source of truth.

## 2026-06-06 Mobile Composer Edit Mode Clearance

- Added a Mobile composer mode hook so edit-mode projection is shared by the composer dock and feed controls.
- Raised the scroll-to-latest button above the floating edit strip only while editing a message.
- Kept message copy/edit actions on demand instead of rendering persistent copy pills over conversation text, while preserving selectable assistant response text.
- Expanded edit-mode composer text to a three-line scrollable input so long prompts remain editable inside the dock.

## 2026-06-06 Mobile Agent Thread Scope Reset

- Added a Mobile thread scope Module so persisted Agent thread selection is cleared when the first Workspace organization resolves or when the user switches organizations.
- Kept Workspace as the Agent thread source of truth while making the mobile reset decision testable outside the native conversation controller.

## 2026-06-04 Mobile Clerk Workspace Auth

- Replaced the Mobile Better Auth client seam with a Clerk Expo facade backed by SecureStore token cache.
- Added mobile Clerk bearer-token forwarding through `workspaceApiFetch` so Workspace Hono APIs can resolve Clerk identity before Convex auth token forwarding.
- Kept the workspace chooser, selected-organization reset behavior, and Agent API paths stable while requiring Clerk publishable-key configuration for production mobile builds.
- Added selected-organization request context headers, including Clerk organization metadata regions, so Workspace APIs can derive mobile region context from the selected organization.
- Split email/password auth into a dedicated Mobile auth route with Clerk login, signup, and email-code verification, leaving the landing auth route as the social/email choice surface.
- Added native iOS Apple sign-in through Clerk's Expo Apple adapter and the `expo-apple-authentication` config plugin; Google remains on the Clerk SSO helper.
- Added an Android `@expo/ui` Jetpack Compose adapter for the dedicated email/password route so Android uses native Compose filter-chip tabs, non-secret text inputs, and submit button while secure password fields keep the React Native secure-input fallback.
- Added a Mobile Clerk email/password auth Module so the dedicated route owns presentation state while sign-in, sign-up, email-code verification, and Clerk error projection stay behind a smaller Interface.
- Kept missing email verification-code handling inside the Mobile Clerk email/password auth Module so the route does not leak empty-code validation to Clerk.
- Reshaped the Mobile auth entry to match the modal reference pattern: a bottom auth sheet with Apple, Google, Sign up, and Log in actions, and a dedicated stepped email modal for email-first, password, and verification states.
- Distilled the Mobile auth entry visual hierarchy after device review: removed the oversized close control, clipped hero headline, duplicate sheet logo, and heavy bottom sheet chrome in favor of a centered QENTRAH brand and direct action stack.
- Removed the experimental auth UI chrome and platform-specific email-screen styling in favor of basic Apple-style mobile screens with stable flex sizing, 44-point controls, standard rounded fields, and predictable safe-area spacing.
- Added keyboard-safe layout to the Mobile email auth route so email, password, and verification inputs remain reachable while the software keyboard is open.
- Removed the incompatible `@expo/ui` native adapters after iOS build failure; the auth screens now use React Native controls so the native app can compile while keeping keyboard-dismiss behavior and larger field spacing.
- Removed the password visibility toggle from the Mobile email auth input so the password field stays secure and visually simpler.

## 2026-05-28 Enterprise Agent Safety Gateway

- Added a shared Agent tool policy gateway for in-product agent tool calls and MCP agent-link calls.
- Extended tool metadata with risk level, approval requirement, and data sensitivity so policy decisions are explicit instead of inferred from tool names alone.
- In-product agent writes now route through the approval policy: ordinary write actions require user approval, while high-impact organization/member/role/destructive actions require admin approval.
- Preserved encrypted Agent message, confirmation input, memory, and tool-preview storage while keeping model-visible previews redacted.

## 2026-05-28 Mobile Thread History Presentation Depth

- Added a Mobile thread history presentation Module so the Threads screen no longer owns title fallback or thread timestamp/date label selection inline.
- Preserved thread opening, favorite toggling, pagination, and date display semantics while making the thread history Interface testable outside the native screen.

## 2026-05-28 Mobile Composer Attachment Depth

- Deepened the Mobile Agent attachment presentation Module with composer progress percent and pending attachment removal commands.
- Added sent-message attachment preview projection to the same Module so composer and message previews share the five-file visibility policy.
- Preserved composer upload progress clamping, disabled uploading removal, pending attachment merge behavior, and retry error state while removing queue mutation details from the dock.

## 2026-05-28 Mobile User Presentation Depth

- Added a Mobile user presentation Module for display-name, avatar URL, and initials projection shared by Home, Profile, and Chat Drawer account surfaces.
- Preserved avatar fallback behavior and account screen copy while removing repeated initials logic from app screens.

## 2026-05-28 Mobile Composer Layout Depth

- Deepened the Mobile composer dock layout Module with line-count, expansion, and measured-height deadzone projection.
- Preserved composer height bounds, scroll threshold, newline behavior, and native content-size update semantics while keeping the hook focused on React state wiring.

## 2026-05-28 Mobile Drawer Thread History Depth

- Reused the Mobile thread history presentation Module from the drawer history list so compact and full history surfaces share the same title fallback seam.
- Removed raw `any` thread handling from `ChatDrawerContent`; the drawer now depends on the shared thread history presentation Interface.

## 2026-05-28 Mobile Attachment File Mapping Depth

- Added an Agent attachment file-mapping Module for picker asset normalization, MIME-kind inference, upload identity matching, and UploadThing result projection.
- Kept `agentAttachments.ts` as the picker/upload Adapter while preserving document/media picker options, progress events, and uploaded attachment response shape.
- Typed the local upload-result projection Interface while leaving the third-party UploadThing Adapter cast isolated at the call seam.

## 2026-05-28 Mobile Voice Composer State Depth

- Added a Voice Composer State Module for audio-level normalization, transcript/result projection, and fixed unavailable/error copy.
- Kept `useVoiceComposer` focused on native speech Adapter events, store writes, and analytics while preserving voice state transitions and user-facing messages.

## 2026-05-28 Mobile Conversation Data Mapping Depth

- Added a Conversation Data Mapping Module for Agent thread activity sorting, Agent message to mobile timeline projection, related property extraction, source extraction, and message chronological ordering.
- Kept `conversationData.ts` focused on React query lifecycle, Workspace identity gating, E2E mode, and refresh state while preserving list/message ordering and timeline message shape.

## 2026-05-28 Mobile Theme Interface Depth

- Replaced broad `colors: any` style seams across mobile screens, shell surfaces, conversation surfaces, primitives, and voice visualization with the shared `AppColors` Interface.
- Tightened safe-area style inputs in shared shell and conversation surfaces to `EdgeInsets`, keeping theme and layout contracts explicit without changing rendered styles.

## 2026-05-28 Mobile UI Metadata Typing Depth

- Replaced shell error-state icon `any` contracts with the `LucideIcon` Interface supplied by the icon Adapter.
- Removed an assistant block suggestion cast now that the Assistant block Interface already exposes optional suggestions.
- Replaced remaining untyped mobile text/table style props with React Native `StyleProp` Interfaces while preserving caller style flexibility.

## 2026-05-28 Agent Task Search Depth

- Deepened the Agent tool input Module with task search filtering used by the tool executor.
- Preserved `tasks_list` input shape, title/notes matching, pagination limits, and tool output shape while removing search filtering from the executor switch.

## 2026-05-28 Agent Convex Read Surface

- Added `convex/agents/readSurface.ts` so Agent read limits, id presentation, thread page mapping, chronological message ordering, and encrypted content reveal live behind one Convex read Module.
- Preserved `convex/agents/read.ts` exported query names, validators, permission checks, organization ownership checks, pagination shape, and encrypted text reveal semantics.

## 2026-05-28 Agent Chat Request Depth

- Added a browser Agent chat request Module so stream request construction, SSE chunk parsing, and HTTP error mapping sit behind one Interface instead of the Convex hook file.
- Preserved the public `@/domains/agents` exports, `/api/v1/organizations/:organizationId/agents/chat` request shape, streamed event parsing, and error text behavior.

## 2026-05-28 Tool Input And Conversation Runtime Depth

- Added Agent tool executor Module so `tool-adapter.ts` stays focused on catalog exposure, risk checks, logging, and confirmation orchestration.
- Added Agent tool input Module so `tool-adapter.ts` no longer owns schemas, pagination bounds, output compaction, date range helpers, or media attachment normalization.
- Added the Agent conversation runtime Module for dashboard attachment uploads, message direction, visible message reconciliation, and thread URL composition.
- Preserved tool names, tool input contracts, risk/confirmation flow, run streaming behavior, and conversation persistence.

## 2026-05-28 Agent Tool Adapter Depth

- Added Agent tool permission and confirmation Modules so `tool-adapter.ts` no longer owns capability projection or confirmation persistence details.
- Preserved Agent tool catalog, risk policy, streaming behavior, and confirmation event semantics.

## 2026-05-28 Language Policy Depth

- Created lifecycle docs for the Workspace Agent run runtime.
- Extracted Agent language detection, system prompt construction, and model prompt construction into `agent-language.ts`.
- Kept `orchestrator.ts` as the stable run Interface and preserved the `detectAgentResponseLanguage` export for existing tests and callers.

## Mobile auth custom haptics
- Added `react-native-hapticlabs` and `react-native-fs` so the mobile app can play a bundled Core Haptics AHAP wave instead of relying only on Expo's predefined haptics.
- Added `QentrahTypewriterWave.ahap`, a short low-sharpness continuous pattern with uneven intensity curves for the auth typewriter headline.
- Routed typewriter feedback through a throttled haptics helper with Expo selection fallback.

## Mobile email auth keyboard handling
- Redesigned the email/password auth screen around a darker zinc card matching the mobile auth landing surface.
- Added a custom keyboard clearance hook that dismisses on outside taps and scrolls focused fields with screen-size-based extra clearance.
- Tightened TextInput padding and height to reduce oversized native field spacing.
