import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const popoverSource = readFileSync(
  fileURLToPath(new URL("../cell-renderers/popover-editor.tsx", import.meta.url)),
  "utf8",
)
const tableSource = readFileSync(
  fileURLToPath(new URL("../qentrah-table.tsx", import.meta.url)),
  "utf8",
)

describe("Qentrah table quick editors and dark theme", () => {
  it("keeps cell editors non-modal without a full-screen scrim", () => {
    expect(popoverSource).toContain("data-qentrah-cell-popover")
    expect(popoverSource).not.toContain("data-qentrah-cell-popover-scrim")
    expect(popoverSource).not.toContain("position: \"fixed\",\n                  inset: 0")
  })

  it("uses dark-theme semantic blends for Task table separators", () => {
    expect(tableSource).toContain(
      '.qentrah-table-wrapper.qentrah-task-table[data-ag-theme-mode="dark"]',
    )
    expect(tableSource).toContain(
      "--q-cell-divider: color-mix(in srgb, var(--q-border) 55%, transparent)",
    )
    expect(tableSource).toContain(
      "--q-header-divider: color-mix(in srgb, var(--q-border) 82%, transparent)",
    )
  })
})
