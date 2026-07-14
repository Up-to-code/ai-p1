import type { SearchFilterConfiguration, SearchResourceType, SearchScopeType, SearchSensitivity } from "@qentrah/domain-contracts"

const resourceTypes = ["project", "task", "attachment", "lead", "company", "contact", "proposal", "contract", "engagement", "deliverable"] as const satisfies readonly SearchResourceType[]
const scopeTypes = ["organization", "space", "project", "private"] as const satisfies readonly SearchScopeType[]
const sensitivityValues = ["standard", "restricted", "confidential"] as const satisfies readonly SearchSensitivity[]

export function searchConfigurationFromParams(params: URLSearchParams): SearchFilterConfiguration {
  return {
    search: params.get("q")?.trim() ?? "",
    resourceTypes: enumValues(params.get("types"), resourceTypes),
    scopeTypes: enumValues(params.get("scopes"), scopeTypes),
    sensitivity: enumValues(params.get("sensitivity"), sensitivityValues),
    locales: textValues(params.get("locales")),
    spaceIds: textValues(params.get("spaces")),
    projectIds: textValues(params.get("projects")),
    ownerIds: textValues(params.get("owners")),
    assigneeIds: textValues(params.get("assignees")),
    clientIds: textValues(params.get("clients")),
    statuses: textValues(params.get("statuses")),
    tagIds: textValues(params.get("tags")),
    dateFrom: dateBoundary(params.get("from"), false),
    dateTo: dateBoundary(params.get("to"), true),
  }
}

export function paramsFromSearchConfiguration(configuration: SearchFilterConfiguration) {
  const params = new URLSearchParams()
  set(params, "q", configuration.search.trim())
  set(params, "types", configuration.resourceTypes?.join(","))
  set(params, "scopes", configuration.scopeTypes?.join(","))
  set(params, "sensitivity", configuration.sensitivity?.join(","))
  set(params, "locales", configuration.locales?.join(","))
  set(params, "spaces", configuration.spaceIds?.join(","))
  set(params, "projects", configuration.projectIds?.join(","))
  set(params, "owners", configuration.ownerIds?.join(","))
  set(params, "assignees", configuration.assigneeIds?.join(","))
  set(params, "clients", configuration.clientIds?.join(","))
  set(params, "statuses", configuration.statuses?.join(","))
  set(params, "tags", configuration.tagIds?.join(","))
  set(params, "from", dateInputValue(configuration.dateFrom))
  set(params, "to", dateInputValue(configuration.dateTo))
  return params
}

export function searchFilterCount(configuration: SearchFilterConfiguration) {
  return Object.entries(configuration).filter(([key, value]) =>
    key !== "search" && (Array.isArray(value) ? value.length > 0 : value !== undefined),
  ).length
}

export function dateInputValue(value?: number) {
  return value === undefined ? "" : new Date(value).toISOString().slice(0, 10)
}

function enumValues<T extends string>(value: string | null, allowed: readonly T[]) {
  const values = textValues(value)?.filter((item): item is T => allowed.some((candidate) => candidate === item))
  return values?.length ? values : undefined
}

function textValues(value: string | null) {
  if (!value) return undefined
  const values = [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))]
  return values.length ? values : undefined
}

function dateBoundary(value: string | null, endOfDay: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return undefined
  const parsed = Date.parse(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`)
  return Number.isFinite(parsed) ? parsed : undefined
}

function set(params: URLSearchParams, key: string, value?: string) {
  if (value) params.set(key, value)
}
