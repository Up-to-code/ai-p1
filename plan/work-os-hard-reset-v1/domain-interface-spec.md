# Domain Interface Spec

This file is the Work OS domain Interface for V1. Runtime code should implement
these records and relationships before adding industry-specific templates.

## Core record ids

| Id | Display name | Supports custom fields | Supports record links | Supports AI actions | Supports automations | Connector access |
| --- | --- | --- | --- | --- | --- | --- |
| `client` | Client | Yes | Yes | Yes | Yes | Yes |
| `opportunity` | Opportunity | Yes | Yes | Yes | Yes | Yes |
| `project` | Project | Yes | Yes | Yes | Yes | Yes |
| `task` | Task | Yes | Yes | Yes | Yes | Yes |
| `calendarEvent` | Calendar event | Yes | Yes | Yes | Yes | Yes |
| `asset` | Asset | Yes | Yes | Yes | Yes | Yes |
| `automation` | Automation rule | No | Limited | Inspect/propose | No self-trigger | Yes |
| `workspaceTemplate` | Workspace template | No | No | Inspect/propose | Applies recipes | Admin only |

## Common fields

All user-owned records use:

- `id`
- `organizationId`
- `workspaceId` when the runtime distinguishes workspace from organization
- `title` or `name`
- `ownerId`
- `status`
- `visibility`
- `tags`
- `createdAt`
- `updatedAt`
- `archivedAt` or `isArchived`

Do not add property, unit, broker, developer, REGA, viewing, bedrooms, bathrooms,
or inventory as common fields.

## Client

Purpose:
Represents a person or organization receiving work or buying a service.

Fields:
- required: `name`, `type`, `ownerId`, `status`, `source`
- optional: `company`, `email`, `phone`, `website`, `contactName`, `notes`,
  `tags`, `customFields`

Default statuses:
- `new`
- `active`
- `nurture`
- `inactive`
- `archived`

Views:
- table by owner, status, source, updated date
- detail with opportunities, projects, tasks, events, assets, notes, activity

AI actions:
- summarize client
- create follow-up task
- draft update
- link opportunity, project, event, task, or asset

Automation triggers:
- client created
- status changed
- owner changed
- custom field changed

## Opportunity

Purpose:
Represents potential revenue, demand, or pipeline work before it becomes
committed delivery.

Fields:
- required: `title`, `stage`, `ownerId`
- optional: `clientId`, `value`, `currency`, `source`, `priority`, `closeDate`,
  `nextStep`, `projectId`, `tags`, `customFields`

Default stages:
- `new`
- `qualified`
- `proposal`
- `negotiation`
- `won`
- `lost`

Views:
- board grouped by stage
- table by owner, stage, value, close date, next step
- detail with linked client, project, tasks, events, assets, activity

AI actions:
- summarize pipeline risk
- move stage
- create next-step task
- draft client update
- link or create project

Automation triggers:
- opportunity created
- stage changed
- close date reached
- value changed

## Project

Purpose:
Represents coordinated work with a team, dates, health, and linked execution.

Fields:
- required: `name`, `ownerId`, `status`
- optional: `clientId`, `opportunityId`, `teamMemberIds`, `health`,
  `startDate`, `endDate`, `budget`, `currency`, `description`, `tags`,
  `customFields`

Default statuses:
- `planned`
- `active`
- `paused`
- `completed`
- `archived`

Health values:
- `onTrack`
- `atRisk`
- `blocked`

Views:
- table by owner, client, status, health, dates
- board grouped by status or health
- detail with tasks, events, assets, opportunity, client, team, activity

AI actions:
- summarize project
- identify blockers
- create task
- schedule event
- link asset

Automation triggers:
- project created
- status changed
- health changed
- end date reached

## Task

Purpose:
Represents actionable work. It is a top-level record, not a client-only child.

Fields:
- required: `title`, `status`, `priority`
- optional: `assigneeId`, `dueDate`, `description`, `checklist`, `tags`,
  `customFields`

Default statuses:
- `todo`
- `inProgress`
- `waiting`
- `done`
- `canceled`

Priority values:
- `low`
- `normal`
- `high`
- `urgent`

Views:
- board grouped by status
- table by assignee, due date, priority, linked records
- detail with checklist, links, notes, activity

AI actions:
- create task
- update status
- summarize overdue work
- propose priority

Automation triggers:
- task created
- status changed
- assignee changed
- due date reached

## Calendar event

Purpose:
Represents scheduled work, deadlines, meetings, milestones, reminders, or focus
time.

Fields:
- required: `title`, `type`, `startAt`, `endAt`
- optional: `ownerId`, `attendeeIds`, `externalAttendees`, `location`,
  `meetingUrl`, `notes`, `tags`, `customFields`

Default types:
- `meeting`
- `deadline`
- `reminder`
- `milestone`
- `focusBlock`

Views:
- calendar
- agenda/list
- detail with attendees, linked records, notes, activity

AI actions:
- schedule event
- summarize day
- create follow-up task
- link event to record

Automation triggers:
- event created
- start time approaching
- event completed
- linked record changed

## Asset

Purpose:
Represents a reusable file, document, media item, link, deliverable, resource, or
operational object.

Fields:
- required: `name`, `type`, `status`, `ownerId`
- optional: `fileId`, `url`, `description`, `metadata`, `tags`, `customFields`

Default types:
- `file`
- `document`
- `image`
- `video`
- `link`
- `deliverable`
- `resource`
- `note`

Default statuses:
- `draft`
- `active`
- `review`
- `approved`
- `archived`

Views:
- table by type, status, owner, updated date
- card grid for visual assets
- detail with preview, links, notes, activity

AI actions:
- summarize asset
- attach to record
- create task from asset
- draft description

Automation triggers:
- asset created
- status changed
- linked record changed

## Automation rule

Purpose:
Represents deterministic rule execution. AI may propose rules, but the rule
executes through automation infrastructure.

Fields:
- required: `name`, `enabled`, `trigger`, `actions`
- optional: `description`, `conditions`, `ownerId`, `lastRunAt`,
  `lastRunStatus`, `lastRunSummary`

Trigger families:
- record created
- field changed
- stage changed
- due date reached
- status changed

Action families:
- create task
- schedule event
- update field
- notify
- link record

Views:
- list by enabled state, trigger, last run
- detail with rule builder and run history

AI actions:
- explain rule
- propose rule
- summarize failures

## Record links

Fields:
- `id`
- `organizationId`
- `sourceRecordType`
- `sourceRecordId`
- `targetRecordType`
- `targetRecordId`
- `linkType`
- `label`
- `createdBy`
- `createdAt`

Allowed link types:
- `related`
- `owns`
- `dependsOn`
- `blocks`
- `createdFrom`
- `attachedTo`

Deletion behavior:
- Deleting or archiving a record must not silently delete the linked record.
- Links pointing at archived records remain visible with archived state.
- Hard deletion cleanup is handled by backend tasks, not UI-only filtering.

## Workspace templates

Purpose:
Represent optional industry or workflow presets. They do not change core record
identity.

Fields:
- `id`
- `name`
- `category`
- `description`
- `version`
- `status`
- `recordLabels`
- `statuses`
- `stages`
- `views`
- `customFieldDefinitions`
- `automationRecipes`

Rule:
Real estate may appear only as an optional template. It cannot be the default
product model and cannot add first-class core schema fields.
