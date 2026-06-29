"use client";

import { useState, useEffect } from "react";
import { useDashboardContext } from "../dashboard-context";
import { Bookmark, Plus, Trash2, ExternalLink, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectBookmark {
  id: string;
  title: string;
  url: string;
}

export function BookmarksWidget() {
  const { projectId } = useDashboardContext();
  const [bookmarks, setBookmarks] = useState<ProjectBookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`project-bookmarks-${projectId}`);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        setBookmarks([]);
      }
    }
  }, [projectId]);

  const saveBookmarksList = (newList: ProjectBookmark[]) => {
    setBookmarks(newList);
    localStorage.setItem(`project-bookmarks-${projectId}`, JSON.stringify(newList));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newBookmark: ProjectBookmark = {
      id: `bookmark-${Date.now()}`,
      title: title.trim(),
      url: formattedUrl,
    };

    const updated = [...bookmarks, newBookmark];
    saveBookmarksList(updated);
    setTitle("");
    setUrl("");
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    saveBookmarksList(updated);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-emerald-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Project Bookmarks
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-primary font-bold hover:underline"
        >
          {showAddForm ? "Cancel" : "Add Link"}
        </button>
      </div>

      {showAddForm ? (
        <form onSubmit={handleAdd} className="space-y-3 bg-muted/20 border border-border/40 p-3 rounded-xl mb-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Figma Design"
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., figma.com/... or github.com"
              className="h-8 text-xs"
            />
          </div>
          <Button type="submit" size="sm" className="w-full h-8 text-xs font-semibold">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Bookmark
          </Button>
        </form>
      ) : null}

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {bookmarks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <Globe className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground/60">No bookmarks saved yet</p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 hover:border-primary/20 bg-muted/10 hover:bg-muted/20 transition-colors group"
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-primary transition-colors text-foreground"
              >
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{bookmark.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">{bookmark.url.replace(/^https?:\/\//i, "")}</p>
                </div>
              </a>

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
