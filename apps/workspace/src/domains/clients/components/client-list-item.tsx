"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/routing"
import { useAccountContext } from "@/domains/auth"
import { useUpdateClientOptimisticMutation, useDeleteClientOptimisticMutation } from "@/domains/clients/api/clients"
import type { Client } from "@/domains/clients/store/clients.types"
import {
  ListItemContainer,
  ListItemAvatar,
  ListItemContent,
  ListItemMeta,
  ListItemActions,
  ListItemTag,
  List,
} from "@qentrah/ui"
import { Badge } from "@qentrah/ui"
import { Edit, Trash2, CheckCircle2, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { type PipelineStage, pipelineStages } from "../client-view-model"

/* ── Badge variant mapping ──────────────────────────────────────────────────── */

function clientStatusBadgeVariant(status: string) {
  switch (status) {
    case "active": return "active" as const
    case "new": return "in-progress" as const
    case "nurture": return "info" as const
    case "inactive": return "inactive" as const
    case "archived": return "archived" as const
    default: return "draft" as const
  }
}

function clientStageBadgeVariant(stage: string) {
  switch (stage) {
    case "blank": return "draft" as const
    case "new_lead": return "in-progress" as const
    case "attempted": return "pending" as const
    case "contacted": return "info" as const
    case "qualified": return "active" as const
    case "unqualified": return "completed" as const
    default: return "draft" as const
  }
}

function clientPriorityBadgeVariant(priority: string) {
  switch (priority) {
    case "urgent": return "critical" as const
    case "high": return "high" as const
    case "normal": return "medium" as const
    default: return "none" as const
  }
}

/* ── Translation helpers ────────────────────────────────────────────────────── */

function fallbackLabel(value: string | null | undefined) {
  const source = String(value ?? "").trim()
  if (!source || source === "undefined") return "—"
  return source
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function translateClientLabel(
  t: ReturnType<typeof useTranslations<"Clients">>,
  namespace: "types" | "statuses" | "stages" | "priorities",
  value: string | null | undefined,
  validValues: ReadonlySet<string>,
) {
  if (value && validValues.has(value)) {
    return t(`${namespace}.${value}`)
  }
  return fallbackLabel(value)
}

const clientStatusValues = new Set(["new", "active", "nurture", "inactive", "archived"])
const clientStageValues = new Set(["blank", "new_lead", "attempted", "contacted", "qualified", "unqualified"])
const clientPriorityValues = new Set(["normal", "high", "urgent"])
const clientTypeValues = new Set(["person", "organization"])

/* ── ClientListItem Component ───────────────────────────────────────────────── */

interface ClientListItemProps {
  client: Client
  onDelete?: (client: Client) => void
  onMarkClosed?: (client: Client) => void
  isClosing?: boolean
  showActions?: boolean
}

export function ClientListItem({
  client,
  onDelete,
  onMarkClosed,
  isClosing = false,
  showActions = true,
}: ClientListItemProps) {
  const t = useTranslations("Clients")
  const router = useRouter()
  const account = useAccountContext()
  const [isHovered, setIsHovered] = useState(false)

  const statusLabel = translateClientLabel(t, "statuses", client.status, clientStatusValues)
  const stageLabel = translateClientLabel(t, "stages", client.pipelineStage, clientStageValues)
  const priorityLabel = translateClientLabel(t, "priorities", client.priority, clientPriorityValues)
  const typeLabel = translateClientLabel(t, "types", client.type, clientTypeValues)

  return (
    <ListItemContainer
      href={`/clients/${client.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      {/* Avatar */}
      <ListItemAvatar
        initials={client.name.charAt(0).toUpperCase()}
        icon={client.type === "organization" ? <Building2 className="h-4 w-4" /> : undefined}
        color={client.type === "organization" ? "#6b5ce7" : "#3b82f6"}
      />

      {/* Content */}
      <ListItemContent
        primary={client.name}
        secondary={client.contact || "No contact"}
        description={client.lastContact ? `Last contact: ${client.lastContact}` : undefined}
      />

      {/* Badges */}
      <ListItemMeta>
        <Badge
          variant={clientStatusBadgeVariant(client.status ?? "new")}
          size="sm"
          showDot
        >
          {statusLabel}
        </Badge>
        <Badge
          variant={clientStageBadgeVariant(client.pipelineStage ?? "new")}
          size="sm"
        >
          {stageLabel}
        </Badge>
        {client.priority && client.priority !== "normal" && (
          <Badge
            variant={clientPriorityBadgeVariant(client.priority)}
            size="sm"
            showIcon
          >
            {priorityLabel}
          </Badge>
        )}
      </ListItemMeta>

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <ListItemMeta>
          {client.tags.slice(0, 2).map((tag) => (
            <ListItemTag key={tag}>{tag}</ListItemTag>
          ))}
          {client.tags.length > 2 && (
            <ListItemTag>+{client.tags.length - 2}</ListItemTag>
          )}
        </ListItemMeta>
      )}

      {/* Actions */}
      {showActions && (
        <ListItemActions>
          {client.pipelineStage !== "closed" && onMarkClosed && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onMarkClosed(client)
              }}
              disabled={isClosing}
              className="p-1.5 rounded-md text-text-muted hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50"
              title={t("actions.markClosed")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              router.push(`/clients/${client.id}/edit`)
            }}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-muted dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(client)
              }}
              className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </ListItemActions>
      )}
    </ListItemContainer>
  )
}

/* ── ClientList Component ───────────────────────────────────────────────────── */

interface ClientListProps {
  clients: Client[]
  onDelete?: (client: Client) => void
  onMarkClosed?: (client: Client) => void
  isClosing?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function ClientList({
  clients,
  onDelete,
  onMarkClosed,
  isClosing,
  emptyTitle = "No clients",
  emptyDescription = "No clients match your search.",
  className,
}: ClientListProps) {
  if (clients.length === 0) {
    return (
      <List className={className}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[13px] font-medium text-text-secondary dark:text-white/60">
            {emptyTitle}
          </p>
          <p className="mt-1 text-[12px] text-text-muted dark:text-white/35">
            {emptyDescription}
          </p>
        </div>
      </List>
    )
  }

  return (
    <List className={className}>
      {clients.map((client) => (
        <ClientListItem
          key={client.id}
          client={client}
          onDelete={onDelete}
          onMarkClosed={onMarkClosed}
          isClosing={isClosing}
        />
      ))}
    </List>
  )
}

export { type ClientListItemProps, type ClientListProps }
