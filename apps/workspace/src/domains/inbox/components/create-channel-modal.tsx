"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ChannelType, ChannelVisibility } from "../types/inbox.types";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChannel: (data: {
    name: string;
    type: ChannelType;
    visibility: ChannelVisibility;
    description?: string;
    projectId?: string;
    clientId?: string;
    memberIds?: string[];
  }) => void;
  isLoading?: boolean;
  projects?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string }>;
  members?: Array<{ id: string; name: string }>;
}

export function CreateChannelModal({
  open,
  onOpenChange,
  onCreateChannel,
  isLoading = false,
  projects = [],
  clients = [],
  members = [],
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ChannelType>("organization");
  const [visibility, setVisibility] = useState<ChannelVisibility>("public");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateChannel({
      name: name.trim(),
      type,
      visibility,
      description: description.trim() || undefined,
      projectId: type === "project" ? projectId : undefined,
      clientId: type === "client" ? clientId : undefined,
      memberIds: selectedMembers.length > 0 ? selectedMembers : undefined,
    });

    // Reset form
    setName("");
    setType("organization");
    setVisibility("public");
    setDescription("");
    setProjectId("");
    setClientId("");
    setSelectedMembers([]);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              placeholder="e.g., general, project-alpha, client-updates"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => value && setType(value as ChannelType)} disabled={isLoading}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="dm">Direct Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(value) => value && setVisibility(value as ChannelVisibility)} disabled={isLoading}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="dm">Direct Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "project" && projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={(value) => value && setProjectId(value)} disabled={isLoading}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "client" && clients.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={(value) => value && setClientId(value)} disabled={isLoading}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {visibility === "private" && members.length > 0 && (
            <div className="space-y-2">
              <Label>Members</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      selectedMembers.includes(member.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent",
                    )}
                  >
                    <div className="h-6 w-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{member.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
