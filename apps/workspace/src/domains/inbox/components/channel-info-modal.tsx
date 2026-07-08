"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Hash, Lock, Trash2, UserPlus, Users } from "lucide-react";
import {
  ModulePanel,
  ModulePanelBody,
  ModulePanelCloseButton,
  ModulePanelContent,
  ModulePanelDescription,
  ModulePanelFooter,
  ModulePanelFullscreenToggle,
  ModulePanelHeader,
  ModulePanelTitle,
} from "@/components/shared/module-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { listOrganizationMembers } from "@/domains/organization/api";
import type {
  Channel,
  ChannelType,
  ChannelVisibility,
} from "../types/inbox.types";

export type ChannelSettingsInput = {
  name: string;
  type: ChannelType;
  visibility: ChannelVisibility;
  description?: string;
  projectId?: string;
  projectIds?: string[];
  clientId?: string;
  spaceId?: string;
  memberIds?: string[];
};

interface ChannelInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel | null;
  currentUserId?: string | null;
  onUpdate?: (updates: ChannelSettingsInput) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

function getVisibilityBadge(visibility: ChannelVisibility) {
  if (visibility === "private") {
    return {
      label: "Private",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    };
  }
  if (visibility === "dm") {
    return {
      label: "DM",
      className: "border-violet-500/20 bg-violet-500/10 text-violet-600",
    };
  }
  return {
    label: "Public",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  };
}

function getChannelIcon(channel: Channel) {
  if (channel.visibility === "private") return <Lock className="h-5 w-5" />;
  if (channel.visibility === "dm") return <Users className="h-5 w-5" />;
  return <Hash className="h-5 w-5" />;
}

export function ChannelInfoModal({
  open,
  onOpenChange,
  channel,
  currentUserId,
  onUpdate,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: ChannelInfoModalProps) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ChannelVisibility>("public");
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const { data: orgMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["organization-members", channel?.organizationId],
    queryFn: () => listOrganizationMembers(channel!.organizationId),
    enabled: Boolean(channel?.organizationId),
  });

  useEffect(() => {
    if (!channel || !open) return;
    setName(channel.name);
    setDescription(channel.description ?? "");
    setVisibility(channel.visibility);
    setMemberIds(channel.memberIds);
  }, [channel, open]);

  const memberRows = useMemo(
    () =>
      (orgMembers ?? []).map((member) => ({
        userId: member.userId,
        name:
          member.user?.name || member.user?.email || member.userId.slice(0, 8),
        email: member.user?.email,
        image: member.user?.image,
        role: member.role,
      })),
    [orgMembers],
  );

  const selectedMembers = memberRows.filter((member) =>
    memberIds.includes(member.userId),
  );
  const currentMember = memberRows.find(
    (member) => member.userId === currentUserId,
  );

  if (!channel) return null;

  const createdDate = new Date(channel.createdAt).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const visibilityBadge = getVisibilityBadge(visibility);
  const currentRoles = new Set(
    (currentMember?.role ?? "")
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean),
  );
  const canManageChannel =
    currentUserId === channel.createdBy || currentRoles.has("owner");
  const isReadOnly = !canManageChannel;
  const isLockedMember = (userId: string) => userId === channel.createdBy;

  const toggleMember = (userId: string) => {
    if (isReadOnly) return;
    if (isLockedMember(userId)) return;
    setMemberIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(channel.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await onUpdate?.({
      name: trimmedName,
      type: channel.type,
      visibility,
      description: description.trim() || undefined,
      projectId: channel.projectId,
      projectIds: channel.projectIds,
      clientId: channel.clientId,
      spaceId: channel.spaceId,
      memberIds,
    });
  };

  const handleDelete = async () => {
    if (isReadOnly) return;
    if (
      !window.confirm(
        `Delete #${channel.name}? This removes the channel and its messages.`,
      )
    ) {
      return;
    }
    await onDelete?.();
  };

  return (
    <ModulePanel
      open={open}
      onOpenChange={onOpenChange}
      defaultWidth={1120}
      defaultHeight={780}
      minWidth={680}
      maxWidth={1600}
      minHeight={520}
      maxHeight={1000}
    >
      <ModulePanelContent className="bg-card">
        <ModulePanelHeader
          left={
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {getChannelIcon(channel)}
              </div>
              <div className="min-w-0">
                <ModulePanelTitle>Channel settings</ModulePanelTitle>
                <ModulePanelDescription className="truncate text-xs">
                  #{channel.name} - created {createdDate}
                </ModulePanelDescription>
              </div>
              {isReadOnly ? (
                <Badge variant="outline" className="rounded-full text-[10px]">
                  Read only
                </Badge>
              ) : null}
            </div>
          }
          right={
            <>
              <ModulePanelFullscreenToggle />
              <ModulePanelCloseButton />
            </>
          }
        />

        <ModulePanelBody className="bg-background">
          <div className="grid min-h-full gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6 border-b border-border p-5 lg:border-b-0 lg:border-r">
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isReadOnly
                      ? "View how this channel appears to your workspace."
                      : "Edit how this channel appears to your workspace."}
                  </p>
                </div>

                <label className="grid gap-1.5 text-xs font-medium text-foreground">
                  Channel name
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Client updates"
                    readOnly={isReadOnly}
                    aria-readonly={isReadOnly}
                    className="h-10"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-medium text-foreground">
                  Description
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What should this channel be used for?"
                    readOnly={isReadOnly}
                    aria-readonly={isReadOnly}
                    className="min-h-24 resize-none"
                  />
                </label>

                {channel.visibility !== "dm" && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-foreground">
                      Visibility
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(["public", "private"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            if (!isReadOnly) setVisibility(option);
                          }}
                          disabled={isReadOnly}
                          aria-readonly={isReadOnly}
                          className={cn(
                            "rounded-lg border px-3 py-3 text-left transition-colors",
                            visibility === option
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-muted",
                            isReadOnly && "cursor-default hover:bg-card",
                          )}
                        >
                          <span className="block text-xs font-semibold capitalize">
                            {option}
                          </span>
                          <span className="mt-1 block text-[11px] leading-4">
                            {option === "public"
                              ? "Visible to everyone in the organization."
                              : "Visible only to selected members."}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Members
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isReadOnly
                        ? "People who can participate in this channel."
                        : "Choose who can participate in this channel."}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full text-[11px]">
                    {memberIds.length} selected
                  </Badge>
                </div>

                <div className="rounded-lg border border-border bg-card">
                  {isLoadingMembers ? (
                    <div className="space-y-1 p-2">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-md px-2 py-2"
                        >
                          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 h-3 w-32 animate-pulse rounded bg-muted" />
                            <div className="h-2.5 w-44 animate-pulse rounded bg-muted/70" />
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            Loading
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto p-2">
                      {memberRows.map((member) => {
                        const checked = memberIds.includes(member.userId);
                        const locked = isLockedMember(member.userId);
                        return (
                          <button
                            key={member.userId}
                            type="button"
                            onClick={() => toggleMember(member.userId)}
                            disabled={isReadOnly || locked}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                              checked ? "bg-muted" : "hover:bg-muted/70",
                              (isReadOnly || locked) &&
                                "cursor-default opacity-90",
                            )}
                          >
                            <Avatar className="h-8 w-8">
                              {member.image ? (
                                <AvatarImage
                                  src={member.image}
                                  alt={member.name}
                                />
                              ) : null}
                              <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                                {member.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-medium text-foreground">
                                {member.name}
                                {member.userId === channel.createdBy
                                  ? " (creator)"
                                  : ""}
                              </span>
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {member.email || member.role || member.userId}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded border",
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border",
                              )}
                            >
                              {checked ? <Check className="h-3 w-3" /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-5 p-5">
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    {getChannelIcon(channel)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {channel.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1 rounded-full border text-[10px]",
                        visibilityBadge.className,
                      )}
                    >
                      {visibilityBadge.label}
                    </Badge>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Channel ID
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <code className="min-w-0 flex-1 truncate text-xs text-foreground">
                    {channel.id}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </section>

              <section className="space-y-2">
                <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Selected members
                </div>
                <div className="space-y-1 rounded-lg border border-border bg-card p-2">
                  {selectedMembers.length > 0 ? (
                    selectedMembers.slice(0, 8).map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-2 rounded-md px-1 py-1"
                      >
                        <Avatar className="h-6 w-6">
                          {member.image ? (
                            <AvatarImage src={member.image} />
                          ) : null}
                          <AvatarFallback className="text-[9px]">
                            {member.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                          {member.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
                      <UserPlus className="h-3.5 w-3.5" />
                      No explicit members selected.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </ModulePanelBody>

        <ModulePanelFooter>
          {isReadOnly ? (
            <p className="text-xs text-muted-foreground">
              Only the channel creator or an organization owner can change this
              channel.
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete channel"}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {isReadOnly ? null : (
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || name.trim().length === 0}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            )}
          </div>
        </ModulePanelFooter>
      </ModulePanelContent>
    </ModulePanel>
  );
}
