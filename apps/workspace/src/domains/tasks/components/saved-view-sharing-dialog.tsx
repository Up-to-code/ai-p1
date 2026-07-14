"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Loader2, ShieldCheck, UserRound, UsersRound } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { listOrganizationMembers } from "@/domains/organization/api/members"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import {
  useMakeSavedViewPersonalMutation,
  useSavedViewGrantsQuery,
  useShareSavedViewMutation,
  type SavedViewGrant,
  type SavedViewRecord,
} from "../api/saved-views"

type GrantCandidate = Readonly<{
  id: string
  type: "user" | "team"
  label: string
  detail: string
}>

export function SavedViewSharingDialog({
  view,
  organizationId,
  open,
  onOpenChange,
}: {
  view: SavedViewRecord | null
  organizationId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const grantsQuery = useSavedViewGrantsQuery(view?._id)
  const [drafts, setDrafts] = useState<Record<string, SavedViewGrant[]>>({})
  const [modeDrafts, setModeDrafts] = useState<Record<string, "shared" | "protected">>({})
  const shareView = useShareSavedViewMutation()
  const makePersonal = useMakeSavedViewPersonalMutation()
  const memberQuery = useQuery({
    queryKey: ["saved-view-share-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId ?? ""),
    enabled: open && Boolean(organizationId),
  })
  const teamQuery = useQuery({
    queryKey: ["saved-view-share-teams", organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listTeams({ query: { organizationId } })
      if (result.error) throw new Error(result.error.message ?? "Teams could not be loaded.")
      return result.data ?? []
    },
    enabled: open && Boolean(organizationId),
  })

  const activeView = view
  if (!activeView) return null
  const viewId = activeView._id
  const grants = drafts[viewId] ?? grantsQuery.data ?? []
  const sharingMode = modeDrafts[viewId] ?? (activeView.sharingMode === "protected" ? "protected" : "shared")
  const candidates: GrantCandidate[] = [
    ...(memberQuery.data ?? []).map((member) => ({
      id: member.userId,
      type: "user" as const,
      label: member.user?.name || member.user?.email || member.userId,
      detail: member.user?.email ?? "Organization member",
    })),
    ...(teamQuery.data ?? []).map((team) => ({
      id: team.id,
      type: "team" as const,
      label: team.name,
      detail: "Live Team membership",
    })),
  ]
  const loading = grantsQuery.isLoading || memberQuery.isLoading || teamQuery.isLoading
  const pending = shareView.isPending || makePersonal.isPending

  function updateGrants(next: SavedViewGrant[]) {
    setDrafts((current) => ({ ...current, [viewId]: next }))
  }

  function toggleCandidate(candidate: GrantCandidate) {
    const existing = grants.find((grant) => grant.principalType === candidate.type && grant.principalId === candidate.id)
    updateGrants(existing
      ? grants.filter((grant) => grant !== existing)
      : [...grants, { principalType: candidate.type, principalId: candidate.id, access: "read" }])
  }

  function toggleConfigure(candidate: GrantCandidate) {
    updateGrants(grants.map((grant) =>
      grant.principalType === candidate.type && grant.principalId === candidate.id
        ? { ...grant, access: grant.access === "configure" ? "read" : "configure" }
        : grant,
    ))
  }

  async function save() {
    try {
      await shareView.mutateAsync({ viewId, sharingMode, grants })
      onOpenChange(false)
    } catch (error) {
      logger.error("saved_views.share_failed", { error, viewId })
    }
  }

  async function stopSharing() {
    try {
      await makePersonal.mutateAsync(viewId)
      setDrafts((current) => ({ ...current, [viewId]: [] }))
      onOpenChange(false)
    } catch (error) {
      logger.error("saved_views.make_personal_failed", { error, viewId })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Share “{activeView.name}”</DialogTitle>
          <DialogDescription>
            Sharing this view never grants access to its underlying tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-2" aria-label="Sharing mode">
            {(["shared", "protected"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModeDrafts((current) => ({ ...current, [viewId]: mode }))}
                className={cn(
                  "rounded-lg border border-border px-3 py-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  sharingMode === mode && "border-primary bg-primary/5",
                )}
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  {mode === "protected" ? <ShieldCheck className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />}
                  {mode === "protected" ? "Protected" : "Shared"}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {mode === "protected" ? "Only configure grants may change it." : "Granted people may open it."}
                </span>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-foreground">People and Teams</p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading access principals…
                </div>
              ) : candidates.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-muted-foreground">No members or Teams are available.</p>
              ) : candidates.map((candidate) => {
                const grant = grants.find((item) => item.principalType === candidate.type && item.principalId === candidate.id)
                return (
                  <div key={`${candidate.type}:${candidate.id}`} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleCandidate(candidate)}
                      aria-pressed={Boolean(grant)}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border",
                        grant && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {grant ? <Check className="h-3.5 w-3.5" /> : null}
                    </button>
                    {candidate.type === "team" ? <UsersRound className="h-4 w-4 text-muted-foreground" /> : <UserRound className="h-4 w-4 text-muted-foreground" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{candidate.label}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{candidate.detail}</p>
                    </div>
                    {grant ? (
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => toggleConfigure(candidate)}>
                        {grant.access === "configure" ? "Can configure" : "Can view"}
                      </Button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-5 py-3">
          {activeView.sharingMode !== "personal" ? (
            <Button type="button" variant="ghost" onClick={() => void stopSharing()} disabled={pending} className="me-auto">
              Make personal
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={() => void save()} disabled={pending || loading}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
