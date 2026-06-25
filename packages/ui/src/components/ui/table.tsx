"use client"

import { forwardRef, type ComponentPropsWithRef, type HTMLAttributes } from "react"
import { cn } from "@qentrah/platform-core/classnames"

/* ── Table Container ────────────────────────────────────────────────────────── */
const Table = forwardRef<HTMLTableElement, ComponentPropsWithRef<"table">>(
  ({ className, ...props }, ref) => (
    <div className="overflow-hidden rounded-[10px] border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={cn("w-full border-collapse text-start", className)}
          {...props}
        />
      </div>
    </div>
  )
)
Table.displayName = "Table"

/* ── Table Header ───────────────────────────────────────────────────────────── */
const TableHeader = forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<"thead">>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("bg-[#f9fafb]", className)}
      {...props}
    />
  )
)
TableHeader.displayName = "TableHeader"

/* ── Table Body ─────────────────────────────────────────────────────────────── */
const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<"tbody">>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("", className)} {...props} />
  )
)
TableBody.displayName = "TableBody"

/* ── Table Row ──────────────────────────────────────────────────────────────── */
interface TableRowProps extends ComponentPropsWithRef<"tr"> {
  inactive?: boolean
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, inactive, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border-light transition-colors hover:bg-[#f9fafb]",
        inactive && "text-text-muted",
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

/* ── Table Head Cell ────────────────────────────────────────────────────────── */
interface TableHeadProps extends ComponentPropsWithRef<"th"> {
  sortable?: boolean
  sortDirection?: "asc" | "desc" | null
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-3.5 py-2.5 text-left text-[12px] font-medium text-text-secondary border-b border-border whitespace-nowrap select-none",
        className
      )}
      {...props}
    >
      {sortable ? (
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-text-primary transition-colors">
          {children}
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={cn("opacity-50", sortDirection === "asc" && "opacity-100 rotate-180")}
          >
            <path d="M3 5l3.5 3.5L10 5" />
          </svg>
        </div>
      ) : (
        children
      )}
    </th>
  )
)
TableHead.displayName = "TableHead"

/* ── Table Cell ─────────────────────────────────────────────────────────────── */
interface TableCellProps extends ComponentPropsWithRef<"td"> {
  muted?: boolean
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, muted, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-3.5 py-2.5 text-[13px] text-text-primary border-b border-border-light align-middle",
        muted && "text-text-secondary text-[12px]",
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

/* ── Table Empty State ──────────────────────────────────────────────────────── */
interface TableEmptyProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: number
  message?: string
}

function TableEmpty({ colSpan, message = "No data available.", className, ...props }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        <div className={cn("text-[14px] text-text-muted", className)} {...props}>
          {message}
        </div>
      </td>
    </tr>
  )
}
TableEmpty.displayName = "TableEmpty"

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
}
