import { describe, expect, it } from "vitest"
import { paramsFromSearchConfiguration, searchConfigurationFromParams, searchFilterCount } from "./search-center-state"

describe("Search Center URL state", () => {
  it("round-trips supported multilingual filters and drops unknown enum values", () => {
    const configuration = searchConfigurationFromParams(new URLSearchParams("q=مشروع&types=task,unknown&scopes=space&locales=ar,en&spaces=s1&from=2026-01-02"))
    expect(configuration).toMatchObject({ search: "مشروع", resourceTypes: ["task"], scopeTypes: ["space"], locales: ["ar", "en"], spaceIds: ["s1"] })
    expect(paramsFromSearchConfiguration(configuration).get("types")).toBe("task")
    expect(searchFilterCount(configuration)).toBe(5)
  })
})
