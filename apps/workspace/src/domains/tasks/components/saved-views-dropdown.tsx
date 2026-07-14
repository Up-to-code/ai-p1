"use client"

import { useState, useCallback } from "react"
import { Bookmark, BookmarkPlus, Check, ChevronDown, Loader2, Share2, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import {
  useSavedViewsQuery,
  useCreateSavedViewMutation,
  useUpdateSavedViewMutation,
  useDeleteSavedViewMutation,
  useSetDefaultSavedViewMutation,
  type SavedViewConfig,
  type SavedViewRecord,
  type SavedViewResourceType,
  type SavedViewType,
} from "@/domains/tasks/api/saved-views"
import { SavedViewSharingDialog } from "./saved-view-sharing-dialog"

export interface SavedViewsDropdownProps {
  resourceType: SavedViewResourceType
  viewType: SavedViewType
  organizationId?: string
  projectId?: string
  spaceId?: string
  currentConfig: SavedViewConfig
  onApply: (config: SavedViewConfig) => void
  className?: string
}

export function SavedViewsDropdown({
  resourceType,
  viewType,
  organizationId,
  projectId,
  spaceId,
  currentConfig,
  onApply,
  className,
}: SavedViewsDropdownProps) {
  const [open, setOpen] = useState(false)
  const [naming, setNaming] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [sharingView, setSharingView] = useState<SavedViewRecord | null>(null)

  const { data: views = [], isLoading } = useSavedViewsQuery({
    resourceType,
    viewType,
    organizationId,
    projectId,
    spaceId,
  })
  const createView = useCreateSavedViewMutation()
  const updateView = useUpdateSavedViewMutation()
  const deleteView = useDeleteSavedViewMutation()
  const setDefault = useSetDefaultSavedViewMutation()

  const handleSaveNew = useCallback(async () => {
    const name = draftName.trim() || "Untitled view"
    const scope = projectId ? "project" : spaceId ? "space" : organizationId ? "workspace" : "global"
    try {
      await createView.mutateAsync({
        name,
        resourceType,
        viewType,
        scope: scope as SavedViewRecord["scope"],
        organizationId,
        projectId,
        spaceId,
        config: currentConfig,
      })
      setDraftName("")
      setNaming(false)
    } catch (e) {
      logger.error("saved_views.save_failed", { error: e })
    }
  }, [
    createView,
    currentConfig,
    draftName,
    organizationId,
    projectId,
    resourceType,
    spaceId,
    viewType,
  ])

  const handleUpdateExisting = useCallback(
    async (view: SavedViewRecord) => {
      try {
        await updateView.mutateAsync({ viewId: view._id, config: currentConfig })
      } catch (e) {
        logger.error("saved_views.update_failed", { error: e })
      }
    },
    [currentConfig, updateView],
  )

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium rounded-md border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
          className,
        )}
      >
        <Bookmark className="h-3.5 w-3.5 opacity-70" />
        Views
        {views.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-muted text-foreground text-[10px] font-bold">
            {views.length}
          </span>
        )}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] p-0 bg-popover text-popover-foreground border border-border shadow-lg rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground">Saved views</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Personal — saved on your account</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setNaming((v) => !v)}
            className="h-6 px-2 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <BookmarkPlus className="h-3 w-3 mr-1" />
            Save current
          </Button>
        </div>

        {naming && (
          <div className="px-3 py-2 border-b border-border bg-muted/40">
            <Input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSaveNew()
                if (e.key === "Escape") {
                  setNaming(false)
                  setDraftName("")
                }
              }}
              placeholder="Name this view…"
              className="h-7 text-[11px] bg-input border-border focus:border-ring"
            />
            <div className="flex items-center justify-end gap-1.5 mt-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNaming(false)
                  setDraftName("")
                }}
                className="h-6 px-2 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveNew}
                disabled={createView.isPending}
                className="h-6 px-2 text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createView.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        )}

        <div className="max-h-[320px] overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-4 text-[11px] text-muted-foreground text-center">
              <Loader2 className="h-3.5 w-3.5 inline-block animate-spin mr-1.5" />
              Loading…
            </div>
          ) : views.length === 0 ? (
            <div className="px-3 py-4 text-[11px] text-muted-foreground text-center">
              No saved views yet. Save the current configuration to reuse it later.
            </div>
          ) : (
            <ul className="py-1">
              {views.map((view) => (
                <li
                  key={view._id}
                  className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted/40 group"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onApply(view.config)
                      setOpen(false)
                    }}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-1.5">
                      {view.isDefault && <Star className="h-3 w-3 text-warning shrink-0" fill="currentColor" />}
                      <span className="text-[11px] font-semibold text-foreground truncate">{view.name}</span>
                    </div>
                    {view.description && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{view.description}</p>
                    )}
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                      {[view.config.groupBy && `group: ${view.config.groupBy}`, view.config.sortBy && `sort: ${view.config.sortBy}`, view.config.filters?.length ? `${view.config.filters.length} filter(s)` : null]
                        .filter(Boolean)
                        .join(" • ") || "default"}
                    </p>
                  </button>
                  {view.canConfigure ? (
                    <button
                      type="button"
                      onClick={() => void handleUpdateExisting(view)}
                      title="Overwrite with current"
                      className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  ) : null}
                  {view.canShare && organizationId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSharingView(view)
                        setOpen(false)
                      }}
                      title="Share view"
                      className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                  ) : null}
                  {view.canSetDefault ? (
                    <button
                      type="button"
                      onClick={() => void setDefault.mutateAsync(view._id)}
                      title={view.isDefault ? "Default" : "Set as default"}
                      className={cn(
                        "h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:opacity-100",
                        view.isDefault && "opacity-100 text-warning",
                        !view.isDefault && "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <Star className="h-3 w-3" fill={view.isDefault ? "currentColor" : "none"} />
                    </button>
                  ) : null}
                  {view.canDelete ? (
                    <button
                      type="button"
                      onClick={() => void deleteView.mutateAsync(view._id)}
                      title="Delete view"
                      className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-error hover:bg-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
      </Popover>
      <SavedViewSharingDialog
        view={sharingView}
        organizationId={organizationId}
        open={Boolean(sharingView)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSharingView(null)
        }}
      />
    </>
  )
}
