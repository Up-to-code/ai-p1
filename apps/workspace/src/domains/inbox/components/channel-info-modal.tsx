"use client";

import { useState, useEffect } from "react";
import {
  X,
  Hash,
  Lock,
  Users,
  Settings,
  Calendar,
  UserPlus,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthSession } from "@/domains/auth";
import { useQuery } from "@tanstack/react-query";
import { listOrganizationMembers } from "@/domains/organization/api";
import type { Channel, ChannelVisibility } from "../types/inbox.types";

interface ChannelInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel;
}

function getVisibilityBadge(visibility: ChannelVisibility) {
  if (visibility === "private")
    return { label: "Private", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
  if (visibility === "dm")
    return { label: "DM", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" };
  return { label: "Public", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
}

export function ChannelInfoModal({
  open,
  onOpenChange,
  channel,
}: ChannelInfoModalProps) {
  const session = useAuthSession();
  const [copied, setCopied] = useState(false);

  const { data: orgMembers } = useQuery({
    queryKey: ["organization-members", channel.organizationId],
    queryFn: () => listOrganizationMembers(channel.organizationId),
    enabled: Boolean(channel.organizationId),
  });

  const memberList = channel.memberIds
    .map((userId) => {
      const member = orgMembers?.find((m) => m.userId === userId);
      return {
        userId,
        name: member?.user?.name || member?.user?.email || userId.slice(0, 8),
        image: member?.user?.image,
        role: member?.role,
      };
    })
    .filter(Boolean);

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(channel.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createdDate = new Date(channel.createdAt).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const vis = getVisibilityBadge(channel.visibility);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col w-full max-w-lg mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        style={{ height: "calc(100vh - 10%)", maxHeight: "90vh" }}>
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-base font-semibold text-foreground">Channel Info</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Channel identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              {channel.visibility === "private" ? <Lock className="h-6 w-6" /> : channel.visibility === "dm" ? <Users className="h-6 w-6" /> : <Hash className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{channel.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-full border ${vis.className}`}>
                  {vis.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created {createdDate}
                </span>
              </div>
            </div>
          </div>

          {/* Channel ID */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Channel ID</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
              <code className="flex-1 text-[13px] text-foreground truncate font-mono">
                {channel.id}
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Description */}
          {channel.description && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
              <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
                {channel.description}
              </p>
            </div>
          )}

          {/* Stats */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Details</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <span className="text-[11px] text-muted-foreground">Type</span>
                <p className="text-[13px] font-medium text-foreground capitalize">{channel.type}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <span className="text-[11px] text-muted-foreground">Members</span>
                <p className="text-[13px] font-medium text-foreground">{channel.memberIds.length}</p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Members ({memberList.length})
              </label>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1">
                <UserPlus className="h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {memberList.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors group"
                >
                  <Avatar className="h-8 w-8">
                    {member.image ? <AvatarImage src={member.image} /> : null}
                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {member.name}
                      {member.userId === channel.createdBy && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground">(creator)</span>
                      )}
                    </p>
                    {member.role && (
                      <p className="text-[11px] text-muted-foreground">{member.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/50 px-6 py-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete channel
          </Button>
        </div>
      </div>
    </div>
  );
}
