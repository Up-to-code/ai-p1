"use client";

import { useState, useMemo } from "react";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";
import { Plus, Trash2, Tag, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "qentrah-project-tags-vocabulary";

function loadVocabulary(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVocabulary(tags: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  } catch {
    // ignore
  }
}

export function ProjectTagsSettings() {
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;

  const projectsQuery = useProjectsIndexQuery(orgId ?? undefined);
  const projects = projectsQuery.results ?? [];

  const usedTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.tags) {
        for (const tag of p.tags) set.add(tag);
      }
    }
    return Array.from(set).sort();
  }, [projects]);

  const [vocabulary, setVocabulary] = useState<string[]>(() => {
    const stored = loadVocabulary();
    // Merge stored with used tags so we don't lose any
    const merged = new Set([...stored, ...usedTags]);
    return Array.from(merged).sort();
  });

  const [newTag, setNewTag] = useState("");

  function addTag() {
    const tag = newTag.trim();
    if (!tag || vocabulary.includes(tag)) {
      setNewTag("");
      return;
    }
    const next = [...vocabulary, tag].sort();
    setVocabulary(next);
    saveVocabulary(next);
    setNewTag("");
  }

  function removeTag(tag: string) {
    const next = vocabulary.filter((t) => t !== tag);
    setVocabulary(next);
    saveVocabulary(next);
  }

  function renameTag(oldTag: string, newTag: string) {
    const trimmed = newTag.trim();
    if (!trimmed || trimmed === oldTag || vocabulary.includes(trimmed)) return;
    const next = vocabulary.map((t) => (t === oldTag ? trimmed : t)).sort();
    setVocabulary(next);
    saveVocabulary(next);
  }

  const projectCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) {
      if (p.tags) {
        for (const tag of p.tags) {
          map.set(tag, (map.get(tag) ?? 0) + 1);
        }
      }
    }
    return map;
  }, [projects]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-border pb-6 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">Project Tags</h1>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              Manage the tag vocabulary used across all projects.
            </p>
          </div>
        </div>
      </div>

      {/* Add tag */}
      <div className="mb-6 flex items-center gap-3">
        <Input
          placeholder="New tag name..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          className="h-10 max-w-xs rounded-xl border-border bg-background/50 text-sm dark:border-white/10 dark:bg-white/5"
        />
        <Button onClick={addTag} disabled={!newTag.trim()} className="h-10 rounded-xl px-5 font-bold">
          <Plus className="me-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {/* Tags list */}
      {vocabulary.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center dark:border-white/10 dark:bg-white/5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted dark:bg-white/10">
            <Tag className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-black text-text-primary">No tags yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-text-secondary">
            Add tags above to build your project tag vocabulary.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 dark:bg-white/[0.02]">
                <tr className="border-b border-border dark:border-white/5">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Tag</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground text-right">Projects Using</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground w-20"></th>
                </tr>
              </thead>
              <tbody>
                {vocabulary.map((tag) => (
                  <TagRow
                    key={tag}
                    tag={tag}
                    count={projectCount.get(tag) ?? 0}
                    onRename={(newName) => renameTag(tag, newName)}
                    onRemove={() => removeTag(tag)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TagRow({
  tag,
  count,
  onRename,
  onRemove,
}: {
  tag: string;
  count: number;
  onRename: (newName: string) => void;
  onRemove: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(tag);

  function commit() {
    setIsEditing(false);
    onRename(draft);
  }

  return (
    <tr className="border-b border-border/70 last:border-0 transition-colors hover:bg-muted/30 dark:border-white/5 dark:hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(tag);
                setIsEditing(false);
              }
            }}
            className="rounded-lg border border-border bg-background/50 px-2 py-1 text-sm font-bold text-foreground outline-none focus:border-primary dark:border-white/10 dark:bg-white/5"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
          >
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {tag}
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
          <FolderKanban className="h-3 w-3" />
          {count}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-red-500 transition-colors"
          title="Remove tag"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
