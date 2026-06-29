"use client"

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import type {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  RowClassParams,
  RowDataTransaction,
  ValueFormatterParams,
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import { cn } from "@qentrah/platform-core/classnames"
import { ensureAgGridModules, qentrahQuartz } from "./theme"

export type QentrahTableDensity = "compact" | "normal"

export interface QentrahTableRef<TRow> {
  api: GridApi<TRow> | null
  /**
   * Update one or more rows in-place without re-rendering the whole grid.
   * Preserves scroll position, selection, and avoids row animation jumps.
   */
  applyUpdate: (rows: TRow[]) => void
  /**
   * Insert one or more rows in-place.
   */
  applyAdd: (rows: TRow[], index?: number) => void
  /**
   * Remove rows by id (or by row data) in-place.
   */
  applyRemove: (rowsOrIds: Array<TRow | string>) => void
}

export interface QentrahTableProps<TRow> {
  rows: TRow[]
  columns: QentrahColumnDef<TRow>[]
  density?: QentrahTableDensity
  /**
   * Controls which colour scheme AG Grid renders with. The active mode
   * is published on `data-ag-theme-mode` so sub-components rendered at
   * the document root (popups, drag-and-drop ghosts, charts) pick up
   * the correct theme.
   *
   * - `"dark"` / `"light"`: pin the mode
   * - `"auto"` (default): follow the page's `.dark` class on
   *   `document.documentElement`
   */
  theme?: "dark" | "light" | "auto"
  height?: number | string
  getRowId?: (row: TRow) => string
  onCellValueChanged?: GridOptions<TRow>["onCellValueChanged"]
  onRowClicked?: GridOptions<TRow>["onRowClicked"]
  onGridReady?: (event: GridReadyEvent<TRow>) => void
  emptyMessage?: string
  rowClass?: (params: RowClassParams<TRow>) => string | string[] | undefined
  rowSelection?: GridOptions<TRow>["rowSelection"]
  suppressRowClickSelection?: boolean
  className?: string
  getRowHeight?: GridOptions<TRow>["getRowHeight"]
  /**
   * When true, animates row movements on data changes.
   * Default true. Set to false when doing in-place cell edits to avoid jump.
   */
  animateRows?: boolean
}

export type QentrahColumnDef<TRow> = ColDef<TRow> & {
  cellEditor?: any
  cellEditorPopup?: boolean
  cellEditorPopupPosition?: "over" | "under"
  cellEditorParams?: any
}

function defaultGetRowId<T extends { id: string }>(row: T): string {
  return row.id
}

const QentrahTableInner = <TRow extends { id: string }>(
  props: QentrahTableProps<TRow>,
  ref: React.ForwardedRef<QentrahTableRef<TRow>>
) => {
  ensureAgGridModules()
  const {
    rows,
    columns,
    density = "compact",
    theme = "dark",
    height = "100%",
    getRowId = defaultGetRowId,
    onCellValueChanged,
    onRowClicked,
    onGridReady,
    emptyMessage = "No rows to show",
    rowClass,
    rowSelection,
    suppressRowClickSelection = true,
    className,
    getRowHeight,
    animateRows = true,
  } = props

  const apiRef = useRef<GridApi<TRow> | null>(null)
  const [isReady, setIsReady] = useState(false)

  useImperativeHandle(
    ref,
    (): QentrahTableRef<TRow> => ({
      get api() { return apiRef.current },
      applyUpdate: (rows: TRow[]) => {
        const tx: RowDataTransaction<TRow> = { update: rows }
        apiRef.current?.applyTransaction(tx)
      },
      applyAdd: (rows: TRow[], index?: number) => {
        const tx: RowDataTransaction<TRow> = { add: rows, addIndex: index }
        apiRef.current?.applyTransaction(tx)
      },
      applyRemove: (rowsOrIds: Array<TRow | string>) => {
        const remove = rowsOrIds.map((r) =>
          typeof r === "string" ? r : (r as any)?.id,
        )
        const tx: RowDataTransaction<TRow> = { remove }
        apiRef.current?.applyTransaction(tx)
      },
    }),
    []
  )

  // Track the page's actual theme by watching the `.dark` class on the
  // document root. This respects an explicit theme set by the app
  // (ThemeProvider, next-themes, etc.) — not just the OS preference.
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    if (document.documentElement.classList.contains("dark")) return true
    return !window.matchMedia?.("(prefers-color-scheme: light)").matches
  })

  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const compute = () => root.classList.contains("dark")
    setSystemIsDark(compute())
    const observer = new MutationObserver(() => {
      setSystemIsDark(compute())
    })
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(prefers-color-scheme: light)")
      const onChange = () => setSystemIsDark(compute())
      mql.addEventListener?.("change", onChange)
      return () => {
        observer.disconnect()
        mql.removeEventListener?.("change", onChange)
      }
    }
    return () => observer.disconnect()
  }, [])

  const resolvedMode: "dark" | "light" =
    theme === "light" ? "light" : theme === "dark" ? "dark" : systemIsDark ? "dark" : "light"

  // Publish the active AG Grid theme mode on `<html>`. AG Grid reads
  // `data-ag-theme-mode` from any ancestor of the grid root to apply the
  // matching colour scheme to sub-components rendered at the document
  // root (popups, drag-and-drop ghosts, charts, tooltips, menus).
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    if (root.dataset.agThemeMode !== resolvedMode) {
      root.dataset.agThemeMode = resolvedMode
    }
  }, [resolvedMode])

  const baseRowHeight = density === "compact" ? 36 : 44
  const baseHeaderHeight = density === "compact" ? 36 : 42

  const defaultColDef: ColDef<TRow> = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 80,
      suppressHeaderMenuButton: false,
      // Default motion: cells flash on value change (1s highlight).
      enableCellChangeFlash: true,
      // Allow text selection inside cells (so users can copy values
      // without disabling row clicks).
      enableCellTextSelection: true,
    }),
    []
  )

  // Default motion durations — the Qentrah feel is calm, not flashy.
  // Short flash, gentle fade. (AG Grid reads these directly from the
  // root grid options, not from defaultColDef.)
  const animationOptions = useMemo(
    () => ({
      cellFlashDuration: 400,
      cellFadeDuration: 600,
    }),
    [],
  )

  return (
    <div
      className={cn(
        "qentrah-table-wrapper w-full",
        density === "compact" ? "qentrah-table--compact" : "qentrah-table--normal",
        className
      )}
      style={{ height }}
      data-ag-theme-mode={resolvedMode}
    >
      <AgGridReact<TRow>
        theme={qentrahQuartz}
        rowData={rows}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        getRowId={(p) => getRowId(p.data)}
        rowHeight={baseRowHeight}
        headerHeight={baseHeaderHeight}
        getRowHeight={getRowHeight}
        animateRows={animateRows}
        cellFlashDuration={animationOptions.cellFlashDuration}
        cellFadeDuration={animationOptions.cellFadeDuration}
        suppressCellFocus={false}
        rowSelection={rowSelection}
        suppressRowClickSelection={suppressRowClickSelection}
        stopEditingWhenCellsLoseFocus
        onCellValueChanged={onCellValueChanged}
        onRowClicked={onRowClicked}
        onGridReady={(event) => {
          apiRef.current = event.api
          setIsReady(true)
          onGridReady?.(event)
        }}
        overlayNoRowsTemplate={`<div class="qentrah-table-empty">${emptyMessage}</div>`}
        getRowClass={rowClass}
        suppressMovableColumns={false}
        suppressMenuHide={false}
      />
      <QentrahTableStyles />
      {!isReady && <div className="qentrah-table-skeleton" aria-hidden />}
    </div>
  )
}

export const QentrahTable = forwardRef(QentrahTableInner) as <TRow extends { id: string }>(
  props: QentrahTableProps<TRow> & { ref?: React.ForwardedRef<QentrahTableRef<TRow>> }
) => ReturnType<typeof QentrahTableInner>

function QentrahTableStyles() {
  return (
    <style
      // eslint-disable-next-line react/no-unknown-property
      dangerouslySetInnerHTML={{ __html: QENTRAH_TABLE_CSS }}
    />
  )
}

const QENTRAH_TABLE_CSS = `
  .qentrah-table-wrapper {
    /* Hover + select use the Qentrah secondary token (a tinted
       surface), never the blue/purple --q-info accent. The
       selected-row left border is intentionally subtle (the same
       color as the row background) so there is no dark line in
       light mode — selection is signalled by the background alone. */
    --q-row-hover: color-mix(in srgb, var(--q-bg-secondary) 80%, transparent);
    --q-row-selected: var(--q-bg-secondary);
    --q-row-selected-border: transparent;
    --q-cell-divider: var(--q-border);
    --q-header-divider: var(--q-border-strong);
    --q-cell-focus: var(--q-text-primary);
    --q-cell-focus-ring: color-mix(in srgb, var(--q-text-primary) 25%, transparent);
  }
  .qentrah-table-wrapper .ag-root-wrapper,
  .qentrah-table-wrapper .ag-header,
  .qentrah-table-wrapper .ag-header-row,
  .qentrah-table-wrapper .ag-cell {
    border: none !important;
  }
  .qentrah-table-wrapper .ag-root-wrapper {
    background: var(--q-card);
    border: 1px solid var(--q-border) !important;
    border-radius: 6px;
  }
  .qentrah-table-wrapper .ag-header,
  .qentrah-table-wrapper .ag-header-row {
    background: var(--q-bg-secondary);
    color: var(--q-text-secondary) !important;
  }
  .qentrah-table-wrapper .ag-header-cell-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--q-text-secondary) !important;
  }
  .qentrah-table-wrapper .ag-cell {
    display: flex;
    align-items: center;
    padding-left: 12px;
    padding-right: 12px;
    line-height: 1.2;
    color: var(--q-text-primary) !important;
    background: transparent;
  }
  .qentrah-table-wrapper .ag-cell-wrapper {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
  }
  .qentrah-table-wrapper .ag-row {
    border-bottom: 1px solid var(--q-cell-divider) !important;
    background: transparent;
  }
  .qentrah-table-wrapper .ag-header {
    border-bottom: 1px solid var(--q-header-divider) !important;
  }
  .qentrah-table-wrapper .ag-header-cell {
    padding-left: 12px;
    padding-right: 12px;
  }
  .qentrah-table-wrapper .ag-pinned-left-header,
  .qentrah-table-wrapper .ag-pinned-left-cols-container {
    border-right: 1px solid var(--q-cell-divider);
  }
  .qentrah-table-wrapper .ag-header-cell-text {
    color: var(--q-text-secondary) !important;
    opacity: 1;
  }
  .qentrah-table-wrapper .ag-row-hover {
    background-color: var(--q-row-hover) !important;
    cursor: default;
  }
  .qentrah-table-wrapper .ag-row-selected,
  .qentrah-table-wrapper .ag-row-selected.ag-row-hover {
    background-color: var(--q-row-selected) !important;
    box-shadow: inset 2px 0 0 0 var(--q-row-selected-border);
  }
  .qentrah-table-wrapper .ag-cell-focus,
  .qentrah-table-wrapper .ag-cell-inline-editing {
    border: 1px solid var(--q-cell-focus) !important;
    box-shadow: 0 0 0 1px var(--q-cell-focus-ring) !important;
  }
  .qentrah-table-wrapper .ag-overlay-no-rows-wrapper {
    background: transparent;
    border: none;
  }
  .qentrah-table-wrapper .qentrah-table-empty {
    color: var(--q-text-muted);
    font-size: 13px;
    padding: 32px 0;
  }
  .qentrah-table-wrapper .ag-floating-filter,
  .qentrah-table-wrapper .ag-header-row.ag-header-row-column-filter {
    border-top: 1px solid var(--q-cell-divider);
  }
  .qentrah-table-wrapper .ag-sort-indicator-container {
    margin-left: 6px;
    opacity: 0.8;
  }
  .qentrah-table-skeleton {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
`

export type QentrahCellRendererParams<T> = ICellRendererParams<T>
export type QentrahValueFormatterParams<T> = ValueFormatterParams<T>
