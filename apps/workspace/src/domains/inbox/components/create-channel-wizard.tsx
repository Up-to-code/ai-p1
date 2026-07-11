"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  FolderKanban,
  Globe,
  Hash,
  Layers,
  Lock,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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

const STEPS: Array<{ id: Step; title: string; description: string }> = [
  { id: "name", title: "Details", description: "Name your channel" },
  { id: "type", title: "Channel type", description: "Choose its purpose" },
  { id: "scope", title: "Access & scope", description: "Connect the right work" },
  { id: "confirm", title: "Review", description: "Confirm and create" },
];

const TYPE_OPTIONS: Array<{
  value: ChannelType;
  label: string;
  description: string;
  icon: typeof Building2;
}> = [
  { value: "organization", label: "Organization", description: "Company-wide updates and conversations", icon: Building2 },
  { value: "space", label: "Space", description: "A focused channel for a team or department", icon: Layers },
  { value: "project", label: "Project", description: "Keep project discussion close to the work", icon: FolderKanban },
  { value: "client", label: "Client", description: "Coordinate client communication and delivery", icon: Users },
  { value: "dm", label: "Direct message", description: "A private conversation with one teammate", icon: MessageSquare },
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
  const [projectId, setProjectId] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [clientId, setClientId] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [dmUserId, setDmUserId] = useState("");
  const [dmUserModalOpen, setDmUserModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const stepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const selectedType = TYPE_OPTIONS.find((option) => option.value === type)!;
  const SelectedTypeIcon = selectedType.icon;

  const canGoNext =
    currentStep === "name"
      ? name.trim().length > 0
      : currentStep === "scope"
        ? type === "project"
          ? Boolean(projectId)
          : type === "client"
            ? Boolean(clientId)
            : type === "space"
              ? Boolean(spaceId)
              : type === "dm"
                ? Boolean(dmUserId)
                : true
        : true;

  const resetForm = () => {
    setCurrentStep("name");
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
    setSubmitError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isLoading) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
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
        spaceId: type === "space" || type === "project" ? spaceId : undefined,
        memberIds:
          visibility === "private" || type === "project"
            ? selectedMemberIds
            : undefined,
        dmUserId: type === "dm" ? dmUserId : undefined,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create channel",
      );
    }
  };

  const handleNext = () => {
    if (!canGoNext || isLoading) return;
    if (currentStep === "confirm") {
      void handleSubmit();
      return;
    }
    setCurrentStep(STEPS[stepIndex + 1].id);
  };

  const handleBack = () => {
    if (stepIndex > 0 && !isLoading) setCurrentStep(STEPS[stepIndex - 1].id);
  };

  const selectType = (nextType: ChannelType) => {
    setType(nextType);
    setVisibility(nextType === "dm" ? "dm" : "public");
    setProjectId("");
    setSelectedProjectIds([]);
    setClientId("");
    setSpaceId("");
    setSelectedMemberIds([]);
    setDmUserId("");
    setShowAdvanced(false);
  };

  const toggleSelectedId = (
    id: string,
    selected: string[],
    setSelected: (value: string[]) => void,
  ) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id],
    );
  };

  const renderVisibilityOptions = () => {
    if (type === "dm") return null;
    return (
      <div className="rounded-xl border border-border bg-muted/20">
        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span>
            <span className="block text-sm font-medium text-foreground">Privacy and members</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {visibility === "private" ? "Private channel" : "Visible to the organization"}
            </span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showAdvanced && "rotate-180")} />
        </button>
        {showAdvanced ? (
          <div className="space-y-4 border-t border-border p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                { value: "public" as const, label: "Public", description: "Anyone in the organization", icon: Globe },
                { value: "private" as const, label: "Private", description: "Invited members only", icon: Lock },
              ]).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setVisibility(option.value);
                    setSelectedMemberIds([]);
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    visibility === option.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <option.icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className={cn("mt-0.5 block text-[11px]", visibility === option.value ? "text-background/70" : "text-muted-foreground")}>{option.description}</span>
                  </span>
                </button>
              ))}
            </div>
            {visibility === "private" ? (
              <Button type="button" variant="outline" onClick={() => setMemberModalOpen(true)} className="w-full justify-between">
                <span>Choose members</span>
                <span className="text-xs text-muted-foreground">{selectedMemberIds.length} selected</span>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  const renderStep = () => {
    if (currentStep === "name") {
      return (
        <div className="space-y-6">
          <StepHeading title="What should this channel be called?" description="Use a short name your team will recognize immediately." />
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel name</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="channel-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. product-launch" className="h-11 pl-9" disabled={isLoading} autoFocus />
            </div>
            <p className="text-[11px] text-muted-foreground">You can use spaces and punctuation. The name can be changed later.</p>
          </div>
        </div>
      );
    }

    if (currentStep === "type") {
      return (
        <div className="space-y-5">
          <StepHeading title="What is this channel for?" description="Its type controls where it appears and what work can be connected." />
          <div className="grid gap-2 sm:grid-cols-2">
            {TYPE_OPTIONS.map((option) => (
              <button key={option.value} type="button" onClick={() => selectType(option.value)} className={cn("group flex min-h-24 items-start gap-3 rounded-xl border p-3.5 text-left transition-colors", type === option.value ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted/40")}>
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", type === option.value ? "bg-background/15" : "bg-muted text-muted-foreground group-hover:text-foreground")}><option.icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-medium"><span>{option.label}</span>{type === option.value ? <Check className="h-4 w-4" /> : null}</span>
                  <span className={cn("mt-1 block text-[11px] leading-4", type === option.value ? "text-background/70" : "text-muted-foreground")}>{option.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === "scope") {
      return (
        <div className="space-y-5">
          <StepHeading title={type === "dm" ? "Choose a teammate" : `Set the ${selectedType.label.toLowerCase()} scope`} description={type === "organization" ? "This channel starts organization-wide. You can make it private below." : "Connect the conversation to the place where this work lives."} />
          {type === "organization" ? (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4"><Globe className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium text-foreground">Organization-wide</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Everyone in the organization can discover and join this channel.</p></div></div>
          ) : null}
          {type === "space" ? (
            <div className="space-y-4">
              <FieldSelect label="Space" value={spaceId} placeholder="Choose a space" items={spaces} onChange={(value) => { setSpaceId(value); setSelectedProjectIds([]); }} />
              {spaceId && projects.length > 0 ? (
                <SelectionList title="Connected projects" description="Optional—link this channel to relevant projects." allLabel="All projects" items={projects} selectedIds={selectedProjectIds} onToggle={(id) => toggleSelectedId(id, selectedProjectIds, setSelectedProjectIds)} onToggleAll={() => setSelectedProjectIds(selectedProjectIds.length === projects.length ? [] : projects.map((project) => project.id))} />
              ) : null}
            </div>
          ) : null}
          {type === "project" ? (
            <div className="space-y-4">
              <FieldSelect label="Project" value={projectId} placeholder="Choose a project" items={projects} onChange={(value) => { setProjectId(value); setSpaceId(""); }} />
              {projectId && spaces.length > 0 ? <FieldSelect label="Space (optional)" value={spaceId} placeholder="No specific space" items={spaces} onChange={setSpaceId} /> : null}
            </div>
          ) : null}
          {type === "client" ? <FieldSelect label="Client" value={clientId} placeholder="Choose a client" items={clients} onChange={setClientId} /> : null}
          {type === "dm" ? (
            <Button type="button" variant="outline" onClick={() => setDmUserModalOpen(true)} className="h-12 w-full justify-between"><span>{dmUserId ? members.find((member) => member.id === dmUserId)?.name ?? "Selected teammate" : "Select a teammate"}</span><Users className="h-4 w-4 text-muted-foreground" /></Button>
          ) : null}
          {renderVisibilityOptions()}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <StepHeading title="Ready to create your channel?" description="Review the details below. You can change these settings later." />
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border bg-muted/20 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background"><SelectedTypeIcon className="h-4 w-4" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground"># {name}</p><p className="mt-0.5 text-xs text-muted-foreground">{selectedType.label} channel</p></div>
          </div>
          <div className="divide-y divide-border px-4">
            <ReviewRow label="Visibility" value={type === "dm" ? "Private conversation" : visibility === "private" ? "Private" : "Public"} />
            {type === "space" ? <ReviewRow label="Space" value={spaces.find((space) => space.id === spaceId)?.name ?? "—"} /> : null}
            {type === "project" ? <ReviewRow label="Project" value={projects.find((project) => project.id === projectId)?.name ?? "—"} /> : null}
            {type === "client" ? <ReviewRow label="Client" value={clients.find((client) => client.id === clientId)?.name ?? "—"} /> : null}
            {type === "dm" ? <ReviewRow label="Teammate" value={members.find((member) => member.id === dmUserId)?.name ?? "—"} /> : null}
            {selectedMemberIds.length > 0 ? <ReviewRow label="Members" value={`${selectedMemberIds.length} selected`} /> : null}
          </div>
        </div>
        <div className="space-y-2"><Label htmlFor="channel-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="channel-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What will your team discuss here?" disabled={isLoading} /></div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="h-[min(620px,calc(100dvh-2rem))] max-w-[960px] gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground" containerClassName="p-2 sm:p-4">
        <DialogHeader className="sr-only"><DialogTitle>Create channel</DialogTitle></DialogHeader>
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] md:grid-cols-[240px_minmax(0,1fr)] md:grid-rows-1">
          <aside className="relative flex flex-col border-b border-border bg-muted/30 px-5 py-4 md:border-b-0 md:border-r md:px-5 md:py-6">
            <div className="mb-4 flex items-center gap-2 md:mb-8"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background"><Hash className="h-4 w-4" /></span><p className="text-sm font-semibold text-foreground">Create channel</p></div>
            <nav aria-label="Channel creation progress" className="grid grid-cols-4 gap-1 md:grid-cols-1 md:gap-2">
              {STEPS.map((step, index) => {
                const completed = index < stepIndex;
                const active = index === stepIndex;
                return (
                  <button key={step.id} type="button" disabled={index > stepIndex || isLoading} onClick={() => index <= stepIndex && setCurrentStep(step.id)} className={cn("flex min-w-0 items-center gap-3 rounded-lg p-2 text-left transition-colors", active && "bg-card shadow-sm ring-1 ring-border", !active && index <= stepIndex && "hover:bg-card/60", index > stepIndex && "cursor-default opacity-50")}>
                    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold", completed && "border-foreground bg-foreground text-background", active && "border-foreground text-foreground", !completed && !active && "border-border text-muted-foreground")}>{completed ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
                    <span className="hidden min-w-0 md:block"><span className="block truncate text-xs font-medium text-foreground">{step.title}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{step.description}</span></span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <form className="flex min-h-0 flex-col" onSubmit={(event) => { event.preventDefault(); handleNext(); }}>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 md:px-10 md:py-8">
              <div className="mx-auto max-w-[620px]">
                {submitError ? <div className="mb-5 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="text-xs font-medium">Couldn’t create channel</p><p className="mt-1 text-xs text-muted-foreground">{submitError}</p></div></div> : null}
                {renderStep()}
              </div>
            </div>
            <footer className="flex items-center justify-between border-t border-border bg-card px-5 py-3 sm:px-8 md:px-10">
              <Button type="button" variant="ghost" onClick={stepIndex === 0 ? () => handleOpenChange(false) : handleBack} disabled={isLoading} className="gap-2"><ArrowLeft className="h-4 w-4" />{stepIndex === 0 ? "Cancel" : "Back"}</Button>
              <Button type="submit" disabled={!canGoNext || isLoading} className="min-w-28 gap-2">{currentStep === "confirm" ? isLoading ? "Creating…" : "Create channel" : "Continue"}{!isLoading ? currentStep === "confirm" ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" /> : null}</Button>
            </footer>
          </form>
        </div>
      </DialogContent>

      <SelectionDialog title="Choose members" open={memberModalOpen} onOpenChange={setMemberModalOpen} items={members} selectedIds={selectedMemberIds} multiple onToggle={(id) => toggleSelectedId(id, selectedMemberIds, setSelectedMemberIds)} />
      <SelectionDialog title="Choose a teammate" open={dmUserModalOpen} onOpenChange={setDmUserModalOpen} items={members} selectedIds={dmUserId ? [dmUserId] : []} onToggle={(id) => { setDmUserId(id); setDmUserModalOpen(false); }} />
    </Dialog>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p></div>;
}

function FieldSelect({ label, value, placeholder, items, onChange }: { label: string; value: string; placeholder: string; items: Array<{ id: string; name: string }>; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label>{label}</Label><Select value={value} onValueChange={(nextValue: string | null) => onChange(nextValue ?? "")}><SelectTrigger className="h-11"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{items.length === 0 ? <SelectItem value="__empty" disabled>No options available</SelectItem> : items.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>;
}

function SelectionList({ title, description, allLabel, items, selectedIds, onToggle, onToggleAll }: { title: string; description: string; allLabel: string; items: Array<{ id: string; name: string }>; selectedIds: string[]; onToggle: (id: string) => void; onToggleAll: () => void }) {
  return <div className="space-y-2"><div><Label>{title}</Label><p className="mt-1 text-[11px] text-muted-foreground">{description}</p></div><div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border p-1.5"><CheckRow label={allLabel} checked={selectedIds.length === items.length} onChange={onToggleAll} strong />{items.map((item) => <CheckRow key={item.id} label={item.name} checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} />)}</div></div>;
}

function CheckRow({ label, checked, onChange, strong = false }: { label: string; checked: boolean; onChange: () => void; strong?: boolean }) {
  return <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50"><input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-border accent-foreground" /><span className={cn("text-xs text-foreground", strong && "font-medium")}>{label}</span></label>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-6 py-3 text-xs"><span className="text-muted-foreground">{label}</span><span className="truncate font-medium text-foreground">{value}</span></div>;
}

function SelectionDialog({ title, open, onOpenChange, items, selectedIds, multiple = false, onToggle }: { title: string; open: boolean; onOpenChange: (open: boolean) => void; items: Array<{ id: string; name: string; email?: string }>; selectedIds: string[]; multiple?: boolean; onToggle: (id: string) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md gap-0 p-0"><DialogHeader className="border-b border-border px-5 py-4"><DialogTitle>{title}</DialogTitle></DialogHeader><div className="max-h-80 space-y-1 overflow-y-auto p-2">{items.length === 0 ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">No organization members available.</p> : items.map((item) => { const selected = selectedIds.includes(item.id); return <button key={item.id} type="button" onClick={() => onToggle(item.id)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted/50", selected && "bg-muted")}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{item.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-foreground">{item.name}</span>{item.email ? <span className="block truncate text-[11px] text-muted-foreground">{item.email}</span> : null}</span>{selected ? <Check className="h-4 w-4 text-foreground" /> : null}</button>; })}</div>{multiple ? <div className="flex items-center justify-between border-t border-border px-5 py-3"><span className="text-xs text-muted-foreground">{selectedIds.length} selected</span><Button type="button" size="sm" onClick={() => onOpenChange(false)}>Done</Button></div> : null}</DialogContent></Dialog>;
}
