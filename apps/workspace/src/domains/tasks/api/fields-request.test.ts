import { afterEach, describe, expect, it, vi } from "vitest"
import {
  createCustomFieldRequest,
  deleteCustomFieldRequest,
  setCustomFieldValueRequest,
  updateCustomFieldDisplayRequest,
} from "./fields"

function okResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("Task custom-field requests", () => {
  it("uses the canonical organization-scoped definition routes", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      okResponse({ fieldId: "field_1", success: true }),
    )
    vi.stubGlobal("fetch", fetcher)

    await createCustomFieldRequest("org 1", { label: "Customer tier", type: "select" })
    await updateCustomFieldDisplayRequest("org 1", "field/1", { tableVisible: false })
    await deleteCustomFieldRequest("org 1", "field/1")

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "/api/v1/organizations/org%201/custom-fields/definitions",
      expect.objectContaining({ method: "POST" }),
    )
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "/api/v1/organizations/org%201/custom-fields/definitions/field%2F1",
      expect.objectContaining({ method: "PATCH" }),
    )
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      "/api/v1/organizations/org%201/custom-fields/definitions/field%2F1",
      { method: "DELETE", headers: undefined, body: undefined },
    )

    const createBody = JSON.parse(fetcher.mock.calls[0]?.[1]?.body as string)
    expect(createBody).toMatchObject({
      key: "customer_tier",
      label: "Customer tier",
      type: "select",
      appliesTo: ["task"],
    })
    expect(createBody).not.toHaveProperty("organizationId")
  })

  it("uses the canonical organization-scoped value route", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => okResponse({ valueId: "value_1" }))
    vi.stubGlobal("fetch", fetcher)

    await setCustomFieldValueRequest(
      "org 1",
      "field_1",
      "customer_tier",
      "select",
      "task_1",
      { selectValue: "enterprise" },
    )

    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/organizations/org%201/custom-fields/values",
      expect.objectContaining({ method: "POST" }),
    )
    const valueBody = JSON.parse(fetcher.mock.calls[0]?.[1]?.body as string)
    expect(valueBody).toEqual({
      fieldDefinitionId: "field_1",
      fieldKey: "customer_tier",
      recordType: "task",
      recordId: "task_1",
      type: "select",
      selectValue: "enterprise",
    })
  })
})
