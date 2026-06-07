# Flexible Layer Spec

This spec defines the configurable Work OS layer for V1: custom field
definitions, automation triggers, and workspace templates. It does not implement
custom field values, filtering, automation conditions, automation actions, or
execution. Those remain separate atomic tasks.

## Custom field definition Interface

Purpose:
Allows workspace templates to add industry or workflow fields without adding
first-class schema fields to core records.

Fields:
- `id`
- `organizationId`
- `workspaceId`
- `templateId`
- `key`
- `label`
- `description`
- `type`
- `required`
- `options`
- `appliesTo`
- `defaultValue`
- `display`
- `order`
- `archivedAt`
- `createdAt`
- `updatedAt`

Allowed field types:
- `text`
- `longText`
- `number`
- `currency`
- `date`
- `dateTime`
- `select`
- `multiSelect`
- `boolean`
- `user`
- `url`

`options` rules:
- Required for `select` and `multiSelect`.
- Empty for non-option field types.
- Each option has `id`, `label`, `color`, `order`, and optional `archivedAt`.
- Archived options remain readable for historical values.

`appliesTo` rules:
- Values are core record ids from [domain-interface-spec.md](./domain-interface-spec.md).
- Allowed record ids: `client`, `opportunity`, `project`, `task`,
  `calendarEvent`, `asset`.
- `automation` and `workspaceTemplate` do not receive custom field values in V1.

Uniqueness:
- `key` is unique per `templateId` and record type.
- `key` uses lower camel case or kebab-safe tokens converted by the backend.
- Labels can be localized later, but key is stable.

Display:
- `display.formSection`
- `display.tableVisible`
- `display.boardVisible`
- `display.detailVisible`
- `display.requiredOnCreate`

Guardrails:
- Do not use custom fields to avoid defining core fields.
- Do not make real-estate fields global defaults.
- Real-estate-specific fields are allowed only inside a real-estate workspace
  template.

## Automation trigger Interface

Purpose:
Defines deterministic events that can start an automation rule.

Common trigger fields:
- `type`
- `recordType`
- `workspaceId`
- `organizationId`
- `actorId`
- `occurredAt`
- `dedupeKey`

Supported trigger types:
- `recordCreated`
- `fieldChanged`
- `stageChanged`
- `statusChanged`
- `dueDateReached`

Supported record types:
- `client`
- `opportunity`
- `project`
- `task`
- `calendarEvent`
- `asset`

Unsupported in V1:
- arbitrary webhooks as triggers
- connector write callbacks as triggers
- AI prompt text as triggers
- cron expressions beyond due-date scheduling
- automations triggering themselves

Payload shapes:

```ts
type RecordCreatedTriggerPayload = {
  type: "recordCreated";
  recordType: CoreRecordType;
  recordId: string;
};

type FieldChangedTriggerPayload = {
  type: "fieldChanged";
  recordType: CoreRecordType;
  recordId: string;
  fieldKey: string;
  previousValue: unknown;
  nextValue: unknown;
};

type StageChangedTriggerPayload = {
  type: "stageChanged";
  recordType: "opportunity";
  recordId: string;
  previousStage: string;
  nextStage: string;
};

type StatusChangedTriggerPayload = {
  type: "statusChanged";
  recordType: CoreRecordType;
  recordId: string;
  previousStatus: string;
  nextStatus: string;
};

type DueDateReachedTriggerPayload = {
  type: "dueDateReached";
  recordType: "task" | "opportunity" | "project" | "calendarEvent";
  recordId: string;
  dueAt: string;
};
```

Disabled or unsupported handling:
- Disabled rules do not evaluate conditions or execute actions.
- Unsupported trigger/record combinations fail validation before save.
- Invalid runtime payloads create a failure log and do not execute actions.

Guardrails:
- AI may propose an automation rule but cannot be a trigger type.
- Connector events may create or update records; those record writes may then
  produce normal supported triggers.

## Workspace template Interface

Purpose:
Defines optional industry or workflow presets. Templates configure labels,
statuses, stages, views, custom fields, and automation recipes without mutating
core record identity.

Fields:
- `id`
- `name`
- `category`
- `description`
- `version`
- `status`
- `createdAt`
- `updatedAt`
- `recordLabels`
- `recordStatuses`
- `opportunityStages`
- `views`
- `customFieldDefinitions`
- `automationRecipes`

Template status:
- `draft`
- `active`
- `archived`

Application behavior:
- New workspaces can start with no template or an active template.
- Applying a template creates custom field definitions and automation recipes
  for that workspace.
- Applying a template never renames core record ids.
- Applying a template never adds first-class schema fields.
- Template updates create a new version instead of mutating historical behavior
  silently.

Real estate template rule:
- Real estate can exist only as an optional template.
- Real-estate custom fields can include labels such as bedrooms, bathrooms,
  listing status, REGA reference, or unit type only inside that template.
- Those labels must not appear in core record contracts, default UI, AI prompts,
  MCP tools, or connector resource names.

Versioning:
- `version` is semantic for human review.
- Active workspace definitions store the template version applied.
- Future template updates require explicit migration or opt-in.

Guardrails:
- Templates can configure labels, statuses, views, custom fields, and automation
  recipes.
- Templates cannot create new core record types in V1.
- Templates cannot weaken permissions, risk policy, or connector scopes.
