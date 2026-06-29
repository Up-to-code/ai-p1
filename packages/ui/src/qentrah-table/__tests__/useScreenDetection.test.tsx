import { describe, expect, it } from "vitest"
import { useScreenDetection } from "../hooks/useScreenDetection"

describe("@qentrah/ui/qentrah-table/useScreenDetection", () => {
  it("exports the hook with the expected API surface", () => {
    expect(typeof useScreenDetection).toBe("function")
    // Calling the hook outside React will throw — that's the expected
    // contract (it's a React hook). We only assert the function shape
    // and the types it returns.
    const ref = { current: null as HTMLElement | null }
    expect(() => {
      // @ts-expect-error: React context required to actually invoke.
      useScreenDetection({ rootRef: ref, selector: "[data-screen-id]", enabled: false })
    }).toThrow()
  })
})
