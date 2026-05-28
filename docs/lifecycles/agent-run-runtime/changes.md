# Changes

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
