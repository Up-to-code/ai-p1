"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";

export type WorkOsCustomFieldType =
  | "text"
  | "longText"
  | "number"
  | "currency"
  | "date"
  | "dateTime"
  | "select"
  | "multiSelect"
  | "boolean"
  | "user"
  | "url"

export interface CustomFieldOption {
  id: string
  label: string
  color?: string
  order: number
  archivedAt?: number
}

export interface CustomFieldDefinition {
  id: string
  key: string
  label: string
  description?: string
  type: WorkOsCustomFieldType
  options?: CustomFieldOption[]
  tableVisible: boolean
  boardVisible: boolean
  detailVisible: boolean
  requiredOnCreate: boolean
  order: number
}

const POPULAR_TYPES: WorkOsCustomFieldType[] = [
  "select",
  "text",
  "date",
  "longText",
  "number",
  "multiSelect",
]

const ALL_TYPES: WorkOsCustomFieldType[] = [
  "boolean",
  "currency",
  "date",
  "dateTime",
  "select",
  "longText",
  "number",
  "multiSelect",
  "text",
  "url",
  "user",
]

export const POPULAR_FIELD_TYPES = POPULAR_TYPES
export const ALL_FIELD_TYPES = ALL_TYPES

export function useFieldDefinitionsQuery(organizationId: string | undefined) {
  const listByOrganization = (api as any).customFields?.read?.listByOrganization
  const listByOrganizationForTable = (api as any).customFields?.read?.listByOrganizationForTable

  const all = useQuery(
    listByOrganization
      ? listByOrganization
      : listByOrganizationForTable ?? api.clientTasks.read.list,
    organizationId ? { organizationId, recordType: "task" } : "skip"
  )
  const visible = useQuery(
    listByOrganizationForTable
      ? listByOrganizationForTable
      : listByOrganization ?? api.clientTasks.read.list,
    organizationId ? { organizationId, recordType: "task" } : "skip"
  )

  const allDefs: any[] = (all as any) ?? []
  const visibleDefs: any[] = (visible as any) ?? []
  const tableVisibleIds = new Set<string>(visibleDefs.map((d: any) => d.id))

  return {
    data: allDefs.map((d: any): CustomFieldDefinition => ({
      id: d.id,
      key: d.key,
      label: d.label,
      description: d.description,
      type: d.type,
      options: d.options,
      tableVisible: tableVisibleIds.has(d.id),
      boardVisible: !!d.display?.boardVisible,
      detailVisible: d.display?.detailVisible ?? true,
      requiredOnCreate: !!d.display?.requiredOnCreate,
      order: d.order ?? 0,
    })),
  }
}

export function useFieldValuesQuery(organizationId: string | undefined, recordType: "task" = "task") {
  const listByOrganization = (api as any).customFields?.values_read?.listByOrganization
  return useQuery(
    listByOrganization ?? api.clientTasks.read.list,
    organizationId ? { organizationId, recordType } : "skip"
  ) as any[] | undefined
}

function fieldKeyFromLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48) || "field"
}

function fieldTypeDefaultOptions(type: WorkOsCustomFieldType): CustomFieldOption[] | undefined {
  if (type !== "select" && type !== "multiSelect") return undefined
  return [
    { id: cryptoId(), label: "Option 1", order: 0 },
    { id: cryptoId(), label: "Option 2", order: 1 },
    { id: cryptoId(), label: "Option 3", order: 2 },
  ]
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function createCustomFieldRequest(
  organizationId: string,
  input: {
    label: string
    type: WorkOsCustomFieldType
    options?: CustomFieldOption[]
  },
) {
  const key = fieldKeyFromLabel(input.label)
  return workspaceMutation<{ fieldId: string }>(organizationId, ["custom-fields", "definitions"], {
    method: "POST",
    body: {
      key,
      label: input.label,
      type: input.type,
      required: false,
      options: input.options ?? fieldTypeDefaultOptions(input.type),
      appliesTo: ["task"],
      display: {
        tableVisible: true,
        boardVisible: false,
        detailVisible: true,
        requiredOnCreate: false,
      },
    },
    fallbackMessage: "Could not create field.",
  })
}

export async function updateCustomFieldDisplayRequest(
  organizationId: string,
  fieldId: string,
  display: { tableVisible?: boolean; boardVisible?: boolean; detailVisible?: boolean; requiredOnCreate?: boolean },
) {
  return workspaceMutation<{ success: boolean }>(organizationId, ["custom-fields", "definitions", fieldId], {
    method: "PATCH",
    body: {
      display: {
        tableVisible: display.tableVisible ?? true,
        boardVisible: display.boardVisible ?? false,
        detailVisible: display.detailVisible ?? true,
        requiredOnCreate: display.requiredOnCreate ?? false,
      },
    },
    fallbackMessage: "Could not update field.",
  })
}

export async function deleteCustomFieldRequest(organizationId: string, fieldId: string) {
  return workspaceMutation<{ success: boolean }>(organizationId, ["custom-fields", "definitions", fieldId], {
    method: "DELETE",
    fallbackMessage: "Could not delete field.",
  })
}

export async function setCustomFieldValueRequest(
  organizationId: string,
  fieldId: string,
  fieldKey: string,
  type: WorkOsCustomFieldType,
  recordId: string,
  value: {
    textValue?: string
    numberValue?: number
    dateValue?: string
    selectValue?: string
    multiSelectValue?: string[]
    booleanValue?: boolean
  },
) {
  return workspaceMutation<{ valueId: string }>(organizationId, ["custom-fields", "values"], {
    method: "POST",
    body: {
      fieldDefinitionId: fieldId,
      fieldKey,
      recordType: "task",
      recordId,
      type,
      ...value,
    },
    fallbackMessage: "Could not save value.",
  })
}
