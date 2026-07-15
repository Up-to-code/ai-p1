"use client";

import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderKanban,
  Hash,
  MessageCircle,
  Plus,
} from "lucide-react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { cn } from "@/lib/utils";

export type ProjectManagementTreeProjection = {
  allProjectsRoute: string;
  spaces: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string;
    projects: Array<{
      id: string;
      name: string;
      route: string;
      taskCount: number;
      documents: Array<{ id: string; title: string; route: string }>;
    }>;
    documents: Array<{ id: string; title: string; route: string }>;
  }>;
  channels: Array<{ id: string; name: string; route: string; scope: string }>;
  directMessages: Array<{ id: string; name: string; route: string }>;
  capabilities: {
    canCreateSpace: boolean;
    canCreateProject: boolean;
    canCreateChannel: boolean;
    canCreateDirectMessage: boolean;
  };
};

export type ProjectManagementTreeProps = {
  projection: ProjectManagementTreeProjection;
  expandedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onCreateSpace: () => void;
  onCreateProject: () => void;
};

function TreeLink({ href, icon, label, trailing, nested = false }: { href: string; icon: React.ReactNode; label: string; trailing?: React.ReactNode; nested?: boolean }) {
  return <WorkspaceLink href={href} className={cn("flex h-7 min-w-0 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground", nested && "ms-5")}><span className="shrink-0 opacity-70">{icon}</span><span className="min-w-0 flex-1 truncate">{label}</span>{trailing}</WorkspaceLink>;
}

function Section({ label, icon, open, onToggle, children }: { label: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <section><button type="button" aria-expanded={open} onClick={onToggle} className="flex h-7 w-full items-center gap-1.5 rounded-md px-1.5 text-start text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent">{open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}{icon}<span className="flex-1 truncate">{label}</span></button>{open ? <div className="mt-0.5 space-y-0.5">{children}</div> : null}</section>;
}

export function ProjectManagementTree({ projection, expandedIds, onToggle, onCreateSpace, onCreateProject }: ProjectManagementTreeProps) {
  return <nav aria-label="Project management" className="space-y-3">
    <TreeLink href={projection.allProjectsRoute} icon={<FolderKanban className="h-3.5 w-3.5" />} label="All projects" />
    <Section label="Spaces" icon={<FolderKanban className="h-3 w-3" />} open={expandedIds.has("spaces")} onToggle={() => onToggle("spaces")}>
      {projection.spaces.map((space) => {
        const spaceKey = `space:${space.id}`;
        const open = expandedIds.has(spaceKey);
        return <div key={space.id}>
          <div className="flex items-center rounded-md hover:bg-accent"><button type="button" aria-label={`${open ? "Collapse" : "Expand"} ${space.name}`} aria-expanded={open} onClick={() => onToggle(spaceKey)} className="grid h-7 w-6 place-items-center text-muted-foreground">{open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</button><WorkspaceLink href="/spaces" extraParams={{ space: space.slug }} className="flex h-7 min-w-0 flex-1 items-center gap-2 pe-2 text-xs font-medium text-muted-foreground hover:text-foreground"><span className={cn("h-2.5 w-2.5 rounded-full", !space.color && "bg-primary")} style={space.color ? { backgroundColor: space.color } : undefined} /><span className="truncate">{space.name}</span></WorkspaceLink></div>
          {open ? <div className="ms-6 border-s border-border/60 ps-1">
            {space.projects.map((project) => { const projectKey = `project:${project.id}`; const projectOpen = expandedIds.has(projectKey); return <div key={project.id}><div className="flex items-center"><button type="button" aria-expanded={projectOpen} aria-label={`${projectOpen ? "Collapse" : "Expand"} ${project.name}`} onClick={() => onToggle(projectKey)} className="grid h-7 w-5 place-items-center text-muted-foreground">{projectOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</button><TreeLink href={project.route} icon={<FolderKanban className="h-3 w-3" />} label={project.name} trailing={project.taskCount ? <span className="text-[10px] tabular-nums">{project.taskCount}</span> : undefined} /></div>{projectOpen ? <div className="ms-4">{project.documents.map((document) => <TreeLink key={document.id} href={document.route} icon={<FileText className="h-3 w-3" />} label={document.title || "Untitled document"} />)}</div> : null}</div>; })}
            {space.documents.length ? <div className="mt-1 border-t border-border/50 pt-1">{space.documents.slice(0, 5).map((document) => <TreeLink key={document.id} href={document.route} icon={<FileText className="h-3 w-3" />} label={document.title || "Untitled document"} nested />)}</div> : null}
          </div> : null}
        </div>;
      })}
      {projection.spaces.length === 0 ? <p className="px-2 py-1 text-xs text-muted-foreground">No accessible spaces</p> : null}
      {projection.capabilities.canCreateSpace ? <button type="button" onClick={onCreateSpace} className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="h-3 w-3" />New space</button> : null}
      {projection.capabilities.canCreateProject ? <button type="button" onClick={onCreateProject} className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="h-3 w-3" />New project</button> : null}
    </Section>
    <Section label="Channels" icon={<Hash className="h-3 w-3" />} open={expandedIds.has("channels")} onToggle={() => onToggle("channels")}>
      {projection.channels.map((channel) => <TreeLink key={channel.id} href={channel.route} icon={<Hash className="h-3 w-3" />} label={channel.name} />)}
      {projection.capabilities.canCreateChannel ? <TreeLink href="/inbox?new=true" icon={<Plus className="h-3 w-3" />} label="Add channel" /> : null}
    </Section>
    <Section label="Direct messages" icon={<MessageCircle className="h-3 w-3" />} open={expandedIds.has("direct-messages")} onToggle={() => onToggle("direct-messages")}>
      {projection.directMessages.map((message) => <TreeLink key={message.id} href={message.route} icon={<MessageCircle className="h-3 w-3" />} label={message.name} />)}
      {projection.capabilities.canCreateDirectMessage ? <TreeLink href="/channels?new=dm" icon={<Plus className="h-3 w-3" />} label="New message" /> : null}
    </Section>
  </nav>;
}
