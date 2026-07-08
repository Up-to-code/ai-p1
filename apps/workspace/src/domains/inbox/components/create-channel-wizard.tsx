"use client";

import { useState } from "react";
import { Check, ChevronRight, Globe, FolderKanban, Users, MessageSquare, Building2, Layers, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Selector, type SelectorOption } from "@/components/ui/selector";
import type { ChannelType, ChannelVisibility } from "../types/inbox.types";

interface CreateChannelWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChannel: (data: {
    name: string;
    type: ChannelType;
    visibility: ChannelVisibility;
    description?: string;
    projectId?: string;
    projectIds?: string[];
    clientId?: string;
    spaceId?: string;
    memberIds?: string[];
    dmUserId?: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
  projects?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string }>;
  spaces?: Array<{ id: string; name: string }>;
  members?: Array<{ id: string; name: string; email?: string }>;
}

type Step = "name" | "type" | "scope" | "confirm";

const STEPS: { id: Step; title: string }[] = [
  { id: "name", title: "Name" },
  { id: "type", title: "Type" },
  { id: "scope", title: "Scope" },
  { id: "confirm", title: "Confirm" },
];

const TYPE_OPTIONS: SelectorOption<ChannelType>[] = [
  { value: "organization", label: "Organization", description: "Global channel for all organization members", icon: Building2 },
  { value: "space", label: "Space", description: "Department-specific channel (e.g., Marketing, Design)", icon: Layers },
  { value: "project", label: "Project", description: "Project-specific channel for team collaboration", icon: FolderKanban },
  { value: "client", label: "Client", description: "Channel for client communication", icon: Users },
  { value: "dm", label: "Direct Message", description: "Private conversation with a specific user", icon: MessageSquare },
];

const VISIBILITY_OPTIONS: SelectorOption<ChannelVisibility>[] = [
  { value: "public", label: "Public", description: "Anyone in the organization can access", icon: Globe },
  { value: "private", label: "Private", description: "Only selected members can access", icon: Users },
];

export function CreateChannelWizard({
  open,
  onOpenChange,
  onCreateChannel,
  isLoading = false,
  projects = [],
  clients = [],
  spaces = [],
  members = [],
}: CreateChannelWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [type, setType] = useState<ChannelType>("organization");
  const [visibility, setVisibility] = useState<ChannelVisibility>("public");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [spaceId, setSpaceId] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [dmUserId, setDmUserId] = useState<string>("");
  const [dmUserModalOpen, setDmUserModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string>("");

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const canGoNext = () => {
    switch (currentStep) {
      case "name":
        return name.trim().length > 0;
      case "type":
        return true;
      case "scope":
        if (type === "project") return projectId.length > 0;
        if (type === "client") return clientId.length > 0;
        if (type === "space") return spaceId.length > 0;
        if (type === "dm") return dmUserId.length > 0;
        return true;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === "confirm") {
      handleSubmit();
      return;
    }
    const nextStepIndex = stepIndex + 1;
    if (nextStepIndex < STEPS.length) {
      setCurrentStep(STEPS[nextStepIndex].id);
    }
  };

  const handleBack = () => {
    const prevStepIndex = stepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(STEPS[prevStepIndex].id);
    }
  };

  const resetForm = () => {
    setName("");
    setType("organization");
    setVisibility("public");
    setDescription("");
    setProjectId("");
    setSelectedProjectIds([]);
    setClientId("");
    setSpaceId("");
    setSelectedMemberIds([]);
    setDmUserId("");
    setShowAdvanced(false);
    setCurrentStep("name");
    setSubmitStatus("idle");
    setSubmitError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isLoading) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    setSubmitStatus("idle");
    setSubmitError("");

    try {
      await onCreateChannel({
        name: name.trim(),
        type,
        visibility,
        description: description.trim() || undefined,
        projectId: type === "project" ? projectId : undefined,
        projectIds: type === "space" ? selectedProjectIds : undefined,
        clientId: type === "client" ? clientId : undefined,
        spaceId: type === "space" ? spaceId : (type === "project" ? spaceId : undefined),
        memberIds: (visibility === "private" || type === "project") ? selectedMemberIds : undefined,
        dmUserId: type === "dm" ? dmUserId : undefined,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitError(error instanceof Error ? error.message : "Failed to create channel");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "name":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-lg">Channel Name</Label>
              <p className="text-sm text-muted-foreground mt-1">Give your channel a clear, descriptive name</p>
            </div>
            <Input
              id="name"
              placeholder="e.g., general, project-alpha, client-updates"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="h-12 text-lg"
              autoFocus
            />
          </div>
        );

      case "type":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-lg">Channel Type</Label>
              <p className="text-sm text-muted-foreground mt-1">Choose what type of channel you want to create</p>
            </div>
            <Selector
              options={TYPE_OPTIONS}
              value={type}
              onChange={(value) => setType(value as ChannelType)}
              orientation="vertical"
            />
          </div>
        );

      case "scope":
        if (type === "organization") {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg">Scope</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  This channel will be available to everyone in the organization
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Global scope</span>
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Advanced Options
                </button>
                {showAdvanced && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label>Visibility</Label>
                      <div className="mt-2">
                        <Selector
                          options={VISIBILITY_OPTIONS}
                          value={visibility}
                          onChange={(value) => { setVisibility(value as ChannelVisibility); setSelectedMemberIds([]); }}
                          orientation="vertical"
                        />
                      </div>
                    </div>
                    {visibility === "private" && (
                      <div>
                        <Label>Members</Label>
                        {members && members.length > 0 ? (
                          <>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">
                              {selectedMemberIds.length === 0
                                ? "No members selected"
                                : selectedMemberIds.length === members.length
                                ? "All members selected"
                                : `${selectedMemberIds.length} member${selectedMemberIds.length !== 1 ? 's' : ''} selected`}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setMemberModalOpen(true)}
                              className="w-full"
                            >
                              Manage Members
                            </Button>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">
                            No members available in this organization
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (type === "dm") {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg">Select User</Label>
                <p className="text-sm text-muted-foreground mt-1">Choose who you want to message</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDmUserModalOpen(true)}
                className="w-full"
              >
                {dmUserId
                  ? (members.find(m => m.id === dmUserId)?.name || "Selected User")
                  : "Select a user"}
              </Button>
            </div>
          );
        }

        if (type === "space") {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg">Space Scope</Label>
                <p className="text-sm text-muted-foreground mt-1">Select the department space this channel belongs to (e.g., Marketing, Design)</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="space">Space</Label>
                  <Select value={spaceId} onValueChange={(value: string | null) => { setSpaceId(value ?? ""); setSelectedProjectIds([]); }} disabled={isLoading}>
                    <SelectTrigger id="space" className="h-12">
                      <SelectValue placeholder="Select a space" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map((space) => (
                        <SelectItem key={space.id} value={space.id}>
                          {space.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {spaceId && (
                  <div>
                    <Label>Connected Projects</Label>
                    <p className="text-xs text-muted-foreground mb-2">Select projects this space channel should be connected to</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProjectIds.length === projects.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjectIds(projects.map(p => p.id));
                            } else {
                              setSelectedProjectIds([]);
                            }
                          }}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span className="text-sm font-medium">All Projects</span>
                      </label>
                      {projects.map((project) => (
                        <label key={project.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProjectIds.includes(project.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProjectIds(prev => [...prev, project.id]);
                              } else {
                                setSelectedProjectIds(prev => prev.filter(id => id !== project.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-border"
                          />
                          <span className="text-sm">{project.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Advanced Options
                </button>
                {showAdvanced && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label>Visibility</Label>
                      <div className="mt-2">
                        <Selector
                          options={VISIBILITY_OPTIONS}
                          value={visibility}
                          onChange={(value) => { setVisibility(value as ChannelVisibility); setSelectedMemberIds([]); }}
                          orientation="vertical"
                        />
                      </div>
                    </div>
                    {visibility === "private" && (
                      <div>
                        <Label>Members</Label>
                        {members && members.length > 0 ? (
                          <>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">
                              {selectedMemberIds.length === 0
                                ? "No members selected"
                                : selectedMemberIds.length === members.length
                                ? "All members selected"
                                : `${selectedMemberIds.length} member${selectedMemberIds.length !== 1 ? 's' : ''} selected`}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setMemberModalOpen(true)}
                              className="w-full"
                            >
                              Manage Members
                            </Button>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">
                            No members available in this organization
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (type === "project") {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg">Project Scope</Label>
                <p className="text-sm text-muted-foreground mt-1">Select the project this channel belongs to</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Select value={projectId} onValueChange={(value: string | null) => { setProjectId(value ?? ""); setSpaceId(""); }} disabled={isLoading}>
                    <SelectTrigger id="project" className="h-12">
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
                {projectId && (
                  <div>
                    <Label htmlFor="sub-space">Space (Optional)</Label>
                    <Select value={spaceId} onValueChange={(value: string | null) => setSpaceId(value ?? "")} disabled={isLoading}>
                      <SelectTrigger id="sub-space" className="h-12">
                        <SelectValue placeholder="Select a space within the project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Global (no specific space)</SelectItem>
                        {spaces.map((space) => (
                          <SelectItem key={space.id} value={space.id}>
                            {space.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Advanced Options
                </button>
                {showAdvanced && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label>Visibility</Label>
                      <div className="mt-2">
                        <Selector
                          options={VISIBILITY_OPTIONS}
                          value={visibility}
                          onChange={(value) => { setVisibility(value as ChannelVisibility); setSelectedMemberIds([]); }}
                          orientation="vertical"
                        />
                      </div>
                    </div>
                    {visibility === "private" && (
                      <div>
                        <Label>Members</Label>
                        {members && members.length > 0 ? (
                          <>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">
                              {selectedMemberIds.length === 0
                                ? "No members selected"
                                : selectedMemberIds.length === members.length
                                ? "All members selected"
                                : `${selectedMemberIds.length} member${selectedMemberIds.length !== 1 ? 's' : ''} selected`}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setMemberModalOpen(true)}
                              className="w-full"
                            >
                              Manage Members
                            </Button>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">
                            No members available in this organization
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (type === "client") {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg">Client Scope</Label>
                <p className="text-sm text-muted-foreground mt-1">Select the client this channel belongs to</p>
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={clientId} onValueChange={(value: string | null) => setClientId(value ?? "")} disabled={isLoading}>
                  <SelectTrigger id="client" className="h-12">
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

              {/* Advanced Options */}
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Advanced Options
                </button>
                {showAdvanced && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label>Visibility</Label>
                      <div className="mt-2">
                        <Selector
                          options={VISIBILITY_OPTIONS}
                          value={visibility}
                          onChange={(value) => { setVisibility(value as ChannelVisibility); setSelectedMemberIds([]); }}
                          orientation="vertical"
                        />
                      </div>
                    </div>
                    {visibility === "private" && (
                      <div>
                        <Label>Members</Label>
                        {members && members.length > 0 ? (
                          <>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">
                              {selectedMemberIds.length === 0
                                ? "No members selected"
                                : selectedMemberIds.length === members.length
                                ? "All members selected"
                                : `${selectedMemberIds.length} member${selectedMemberIds.length !== 1 ? 's' : ''} selected`}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setMemberModalOpen(true)}
                              className="w-full"
                            >
                              Manage Members
                            </Button>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">
                            No members available in this organization
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        return null;

      case "confirm":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg">Review & Create</Label>
              <p className="text-sm text-muted-foreground mt-1">Review your channel settings before creating</p>
            </div>
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{type}</span>
              </div>
              {type === "space" && spaceId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Space</span>
                  <span className="font-medium">{spaces.find(s => s.id === spaceId)?.name}</span>
                </div>
              )}
              {type === "space" && selectedProjectIds.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Connected Projects</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProjectIds.length === projects.length ? (
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">All Projects</span>
                    ) : (
                      selectedProjectIds.map(pid => (
                        <span key={pid} className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {projects.find(p => p.id === pid)?.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
              {type === "project" && projectId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Project</span>
                  <span className="font-medium">{projects.find(p => p.id === projectId)?.name}</span>
                </div>
              )}
              {type === "project" && spaceId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sub-Space</span>
                  <span className="font-medium">{spaces.find(s => s.id === spaceId)?.name}</span>
                </div>
              )}
              {type === "client" && clientId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Client</span>
                  <span className="font-medium">{clients.find(c => c.id === clientId)?.name}</span>
                </div>
              )}
              {type === "dm" && dmUserId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Message</span>
                  <span className="font-medium">{members.find(m => m.id === dmUserId)?.name || "Selected User"}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Visibility</span>
                <span className="font-medium capitalize">{visibility}</span>
              </div>
              {(visibility === "private" || type === "project") && selectedMemberIds.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedMemberIds.length === members.length ? (
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">All Members</span>
                    ) : (
                      selectedMemberIds.map(mid => (
                        <span key={mid} className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {members.find(m => m.id === mid)?.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
              {description && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <span className="font-medium text-right max-w-xs">{description}</span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What's this channel about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden border-border bg-card p-0 text-card-foreground">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>

        {submitStatus === "error" && (
          <div className="mx-6 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Failed to create channel</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{submitError}</p>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center px-6 pt-6">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    stepIndex === index
                      ? "bg-primary text-primary-foreground"
                      : stepIndex > index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {stepIndex > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1",
                    stepIndex === index ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-2 transition-colors",
                    stepIndex > index ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-6 min-h-[300px] px-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={stepIndex === 0 || isLoading}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext() || isLoading}
          >
            {currentStep === "confirm" ? (
              <>
                {isLoading ? "Creating..." : "Create Channel"}
                {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>

      {/* Member Selection Modal */}
      <Dialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMemberIds.length === members.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMemberIds(members.map(m => m.id));
                    } else {
                      setSelectedMemberIds([]);
                    }
                  }}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm font-medium">All Members</span>
              </label>
              {members.map((member) => (
                <label key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMemberIds(prev => [...prev, member.id]);
                      } else {
                        setSelectedMemberIds(prev => prev.filter(id => id !== member.id));
                      }
                    }}
                    className="h-4 w-4 rounded border-border"
                  />
                  <div className="flex-1">
                    <span className="text-sm">{member.name}</span>
                    {member.email && <span className="text-xs text-muted-foreground ml-2">({member.email})</span>}
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setMemberModalOpen(false)}>
              Done ({selectedMemberIds.length} selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DM User Selection Modal */}
      <Dialog open={dmUserModalOpen} onOpenChange={setDmUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => { setDmUserId(member.id); setDmUserModalOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left w-full",
                    dmUserId === member.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium">{member.name}</span>
                    {member.email && <span className="text-xs text-muted-foreground ml-2">({member.email})</span>}
                  </div>
                  {dmUserId === member.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDmUserModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
