"use client";

import React, { useState, useMemo } from "react";
import { type Project } from "../../../store/projects.types";
import { useAccountContext } from "@/domains/auth";
import { EditableSelect } from "@/components/ui/editable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Users, UserPlus, X } from "lucide-react";

interface TeamTabProps {
  project: Project;
  organizationId: string;
}

const roleOptions = [
  { label: "Owner", value: "owner" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

const roleColors: Record<string, "gray" | "green" | "yellow" | "blue" | "red" | "brown" | "orange" | "purple" | "pink"> = {
  owner: "green",
  editor: "blue",
  viewer: "gray",
};

export function TeamTab({ project, organizationId }: TeamTabProps) {
  const account = useAccountContext();
  const [isAdding, setIsAdding] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([
    { id: "1", name: "You", email: account.user?.email ?? "", role: "owner" },
  ]);

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  function getInitials(name: string) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </h3>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          size="sm"
          className="h-8 rounded-xl text-xs font-semibold"
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Add Member
        </Button>
      </div>

      {/* Members list */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/40 px-4 py-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Team Members
        </div>
        <div className="divide-y divide-border">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 transition-colors group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-black text-foreground">
                {getInitials(member.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
              </div>
              <EditableSelect
                value={member.role}
                options={roleOptions}
                onChange={(role) => {
                  setMembers(members.map((m) =>
                    m.id === member.id ? { ...m, role } : m
                  ));
                }}
                colorMapType="team-role"
                defaultColors={roleColors}
              />
              {member.role !== "owner" && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="p-1.5 text-muted-foreground/40 hover:text-red-500 transition-colors rounded-md hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Invite someone to collaborate on this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Email address..."
              type="email"
              className="text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={() => setIsAdding(false)} className="h-8 text-xs">
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
